// src/app/api/ai-chat/route.ts
import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a sharp, no-BS degen crypto analyst. Answer directly, use slang when appropriate, keep it concise.',
        },
        { role: 'user', content: message },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 512,
    });

    const response = completion.choices[0]?.message?.content?.trim() || 'No response from AI';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ response: 'Chat temporarily unavailable — try again soon' }, { status: 500 });
  }
}