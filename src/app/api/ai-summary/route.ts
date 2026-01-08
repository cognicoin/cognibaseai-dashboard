import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { scanResult } = await req.json();

    if (!scanResult) {
      return NextResponse.json({ error: 'No scan data' }, { status: 400 });
    }

    const prompt = `Degen analyst: scan this token data. Is it rug or moonshot? Check honeypot, taxes, locks, dev wallets, mint/freeze, source.
Data: ${JSON.stringify(scanResult)}
JSON response:
{
  "verdict": "STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL",
  "bullets": ["point1", "point2", "point3", "point4"],
  "degenTip": "ape or dump?"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let summary;
    try {
      summary = JSON.parse(raw);
    } catch {
      summary = { verdict: 'Parse failed', bullets: ['Try again'], degenTip: 'Retry scan' };
    }

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('AI Summary error:', error);
    return NextResponse.json({ error: 'AI service failed' }, { status: 500 });
  }
}