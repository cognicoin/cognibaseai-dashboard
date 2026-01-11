// src/app/api/ai-summary/route.ts
// FIXED VERSION - January 10, 2026
// Uses correct PlanName type from rateLimit.ts, modern unlock tier resolution

import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import { rateLimit, PlanName } from '@/lib/rateLimit'; // Import exact PlanName type
import { getValidPaidTier } from '@/lib/unlock';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Resolves user's current paid tier (or fallback) and maps to rateLimit-compatible PlanName
 */
async function resolvePlan(wallet: `0x${string}`): Promise<PlanName> {
  const paidTier = await getValidPaidTier(wallet);

  // Map Unlock paid tiers to exact PlanName strings from rateLimit.ts
  switch (paidTier) {
    case 'architect':
      return 'architect';
    case 'analyst':
      return 'analyst';
    case 'observer+':
      return 'observer+';
    default:
      return 'observer'; // fallback when no paid tier (matches base stake observer)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goPlus, kpis, risk, wallet } = body;

    // Validate wallet (required for tier & rate limiting)
    const w = String(wallet ?? '').trim();
    if (!w.startsWith('0x') || w.length !== 42) {
      return NextResponse.json(
        { error: 'Valid connected wallet address required for rate limiting & tier checks' },
        { status: 401 }
      );
    }

    // Resolve current effective plan & apply rate limit
    const plan: PlanName = await resolvePlan(w as `0x${string}`);
    const rlDecision = rateLimit({ wallet: w, plan, endpoint: 'ai-summary' });

    if (!rlDecision.allowed) {
      return NextResponse.json(
        {
          error: rlDecision.message || 'Rate limit exceeded for your current tier',
          rate: {
            used: rlDecision.used,
            limit: rlDecision.limit,
            remaining: rlDecision.remaining,
            reset: rlDecision.reset,
            plan,
          },
        },
        { status: 429 }
      );
    }

    // Validate required GoPlus data
    if (!goPlus || typeof goPlus !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid GoPlus security data' }, { status: 400 });
    }

    // Build structured prompt
    const prompt = `
You are Cogni AI: a crypto security analyst + smart degen.

Primary source: GoPlus token security scan
Supporting data: Dune KPIs + computed risk score

Core rules:
- NEVER give financial advice or price predictions
- Be brutally honest about risks (honeypot, mintable, proxy, taxes, ownership)
- Use KPIs to adjust confidence (low holders/volume = higher risk, high volatility = caution)
- Keep output concise, degen-style, actionable

Return ONLY valid JSON object with these exact keys:
{
  "verdict": "LOW RISK" | "MEDIUM RISK" | "HIGH RISK",
  "bullets": array of 4-6 short bullet points highlighting key risks/benefits,
  "degenTip": one single sentence actionable take
}

Input data:

GoPlus security scan:
${JSON.stringify(goPlus, null, 2)}

Dune KPIs:
${JSON.stringify(kpis || {}, null, 2)}

Computed risk score:
${JSON.stringify(risk || {}, null, 2)}
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 600,
      top_p: 0.9,
    });

    const rawResponse = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON safely
    const parsed = (() => {
      try {
        const start = rawResponse.indexOf('{');
        const end = rawResponse.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('No JSON found');
        return JSON.parse(rawResponse.slice(start, end + 1));
      } catch {
        return {
          verdict: 'Analysis Unavailable',
          bullets: ['Failed to parse AI response. Please try again.'],
          degenTip: 'Run it back.',
        };
      }
    })();

    return NextResponse.json({
      ...parsed,
      rate: {
        used: rlDecision.used,
        limit: rlDecision.limit,
        remaining: rlDecision.remaining,
        reset: rlDecision.reset,
        plan,
      },
    });
  } catch (error: any) {
    console.error('[ai-summary] Error:', error);
    return NextResponse.json(
      {
        verdict: 'Error',
        bullets: ['Service temporarily unavailable. Please try again soon.'],
        degenTip: 'The AI is taking a smoke break. Retry in a minute.',
      },
      { status: 500 }
    );
  }
}