// src/app/api/token-scan/route.ts
import { NextResponse } from 'next/server';
import { fetchGoPlusSecurity } from '@/lib/goplus';
import { fetchDuneBundle } from '@/lib/dune';
import { mapDuneBundleToKpis } from '@/lib/duneKpis';
import { computeRiskScore } from '@/lib/riskScore';
import { rateLimit } from '@/lib/rateLimit';
import { getValidPaidTier } from '@/lib/unlock'; // <-- Use the modern version we built

type Plan = 'NONE' | 'OBSERVER_PLUS' | 'ANALYST' | 'ARCHITECT';

async function resolvePlan(wallet: `0x${string}`): Promise<Plan> {
  // Use the modern unlock.ts helper (already checks expiry)
  const paidTier = await getValidPaidTier(wallet);

  switch (paidTier) {
    case 'architect':
      return 'ARCHITECT';
    case 'analyst':
      return 'ANALYST';
    case 'observer+':
      return 'OBSERVER_PLUS';
    default:
      return 'NONE';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chainId, address: contractAddress, wallet } = body;

    const cid = String(chainId ?? '').trim();
    const addr = String(contractAddress ?? '').trim().toLowerCase();
    const w = String(wallet ?? '').trim();

    // Validation
    if (!cid || !addr.startsWith('0x') || addr.length !== 42) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing chainId / contract address' },
        { status: 400 }
      );
    }

    if (!w.startsWith('0x') || w.length !== 42) {
      return NextResponse.json(
        { ok: false, error: 'Valid connected wallet address required for rate limiting & tier checks' },
        { status: 401 }
      );
    }

    // Rate limit based on current tier
    const plan = await resolvePlan(w as `0x${string}`);
    const rlDecision = rateLimit({ wallet: w, plan, endpoint: 'token-scan' });

    if (!rlDecision.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: rlDecision.message || 'Rate limit exceeded for your current tier',
          rate: { used: rlDecision.used, limit: rlDecision.limit, remaining: rlDecision.remaining, plan },
        },
        { status: 429 }
      );
    }

    // Fetch security data
    const goPlus = await fetchGoPlusSecurity(cid, addr);

    // Dune only for EVM chains (e.g., Base = 8453); skip for Solana
    let duneBundle = null;
    let kpis = null;

    if (cid === '8453' || Number(cid) === 8453) {
      duneBundle = await fetchDuneBundle(addr);
      kpis = mapDuneBundleToKpis(duneBundle);
    }

    // Compute final risk score (with Dune context if available)
    const risk = computeRiskScore(goPlus, kpis);

    return NextResponse.json({
      ok: true,
      goPlus,
      dune: duneBundle,
      kpis,
      risk,
      rate: {
        used: rlDecision.used,
        limit: rlDecision.limit,
        remaining: rlDecision.remaining,
        reset: rlDecision.reset,
        plan,
      },
    });
  } catch (error: any) {
    console.error('[token-scan] Error:', error);
    const message = error?.message || 'Internal server error during token scan';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}