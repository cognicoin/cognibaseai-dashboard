// src/app/api/ai-chat/route.ts
// FIXED VERSION - January 10, 2026
// Uses correct PlanName type from rateLimit.ts, modern unlock tier resolution

import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import { rateLimit, PlanName } from '@/lib/rateLimit'; // Import PlanName type
import { getValidPaidTier } from '@/lib/unlock';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Resolves user's current paid tier (or fallback) and maps to rateLimit-compatible PlanName
 */
async function resolvePlan(wallet: `0x${string}`): Promise<PlanName> {
  const paidTier = await getValidPaidTier(wallet);

  // Map Unlock tiers to rateLimit PlanName values (exact string match required)
  switch (paidTier) {
    case 'architect':
      return 'architect';
    case 'analyst':
      return 'analyst';
    case 'observer+':
      return 'observer+';
    default:
      return 'observer'; // fallback when no paid tier (matches stake observer)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, wallet } = body;

    // Validate wallet (required for tier & rate limiting)
    const w = String(wallet ?? '').trim();
    if (!w.startsWith('0x') || w.length !== 42) {
      return NextResponse.json(
        { error: 'Valid connected wallet address required for rate limiting & tier checks' },
        { status: 401 }
      );
    }

    // Resolve current effective plan & apply rate limit
    const plan = await resolvePlan(w as `0x${string}`);
    const rlDecision = rateLimit({ wallet: w, plan, endpoint: 'ai-chat' });

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

    // Validate user message
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Message is required and must be at least 5 characters' },
        { status: 400 }
      );
    }

    // System prompt (practical, safe, on-brand)
    const systemPrompt = `
You are Cogni AI — a straightforward crypto assistant for degens and analysts.

Core rules:
- NEVER give financial advice, price predictions, or buy/sell signals
- Be direct, honest, and educational
- Always include risk notes when relevant (scams, rugs, volatility, etc.)
- Keep answers concise but thorough — degen-friendly tone is ok
- If question is off-topic, politely redirect to crypto/tools/security

User message:
${message.trim()}
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 700,
      top_p: 0.9,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || 'No useful response generated. Try rephrasing.';

    return NextResponse.json({
      ok: true,
      response: responseText,
      rate: {
        used: rlDecision.used,
        limit: rlDecision.limit,
        remaining: rlDecision.remaining,
        reset: rlDecision.reset,
        plan,
      },
    });
  } catch (error: any) {
    console.error('[ai-chat] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'AI chat service temporarily unavailable. Try again later.',
      },
      { status: 500 }
    );
  }
}