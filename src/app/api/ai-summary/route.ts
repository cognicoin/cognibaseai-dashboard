// src/app/api/ai-summary/route.ts
import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to extract valid JSON from Groq response (fixes "parse failed")
function extractJSON(text: string) {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON block found');
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    return {
      verdict: 'Analysis Unavailable',
      bullets: ['The AI response could not be parsed. Please try again.'],
      degenTip: 'Retry the scan',
    };
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { scanResult } = await req.json();

    if (!scanResult) {
      return NextResponse.json({ error: 'No scan data provided' }, { status: 400 });
    }

    const prompt = `You are a sharp degen crypto analyst. Analyze this token security data from GoPlusLabs.
Focus on: honeypot risk, mint/freeze authority, taxes, LP locks, ownership renounced, proxy contract, open source.
Be direct and concise.

Data: ${JSON.stringify(scanResult)}

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL",
  "bullets": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "degenTip": "One-sentence alpha call"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',  // Free-tier compatible, fast & reliable
      temperature: 0.7,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    console.log('Raw Groq response:', raw); // For debugging in Vercel logs

    const summary = extractJSON(raw);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('AI Summary error:', error);
    return NextResponse.json({
      verdict: 'Error',
      bullets: ['Service temporarily unavailable'],
      degenTip: 'Please try again later',
    }, { status: 500 });
  }
}