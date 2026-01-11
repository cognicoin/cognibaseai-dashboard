// src/app/api/dune-bundle/route.ts
// Server-side endpoint to fetch Dune analytics bundle for a token (used by dashboard scanner)

import { NextRequest, NextResponse } from 'next/server';
import { fetchDuneBundle } from '@/lib/dune';
import { rateLimit } from '@/lib/rateLimit';
import { getEffectivePlan } from '@/lib/userTier';

// Optional: Add simple global rate limit even for anon calls (Dune API has strict quotas)
const GLOBAL_RATE_LIMIT_KEY = 'dune-bundle:global';
const GLOBAL_LIMIT = 30; // per minute - adjust based on your Dune API plan
const GLOBAL_WINDOW_SECONDS = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress } = body;

    const addr = String(tokenAddress ?? '').trim().toLowerCase();

    // Basic validation
    if (!addr.startsWith('0x') || addr.length !== 42) {
      return NextResponse.json(
        { error: 'Valid Ethereum/Base token address required (0x...)' },
        { status: 400 }
      );
    }

    // Optional: Get wallet from header (if client sends it) for tiered rate limiting
    const walletHeader = req.headers.get('x-wallet-address');
    const wallet = walletHeader ? (walletHeader as `0x${string}`) : undefined;

    let plan = 'observer'; // default/fallback
    if (wallet) {
      const { plan: effectivePlan } = await getEffectivePlan(wallet);
      plan = effectivePlan;
    }

    // Apply rate limit (per wallet if provided, else global)
    const rlKey = wallet ? `dune-bundle:${wallet}` : GLOBAL_RATE_LIMIT_KEY;
    const rlDecision = rateLimit({
      key: rlKey,
      limit: wallet ? 50 : GLOBAL_LIMIT, // higher for paid users, lower for anon/global
      windowSeconds: wallet ? 60 * 60 * 24 : GLOBAL_WINDOW_SECONDS, // daily for users, per-minute global
    });

    if (!rlDecision.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded for Dune queries',
          rate: {
            used: rlDecision.used,
            limit: rlDecision.limit,
            remaining: rlDecision.remaining,
            reset: rlDecision.reset,
          },
        },
        { status: 429 }
      );
    }

    // Fetch the actual Dune data bundle
    const bundle = await fetchDuneBundle(addr);

    return NextResponse.json({
      ok: true,
      bundle,
      rate: {
        used: rlDecision.used,
        limit: rlDecision.limit,
        remaining: rlDecision.remaining,
        reset: rlDecision.reset,
      },
    });
  } catch (error: any) {
    console.error('[dune-bundle] Error:', error);
    const message = error?.message || 'Failed to fetch Dune analytics data';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}