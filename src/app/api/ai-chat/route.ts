import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 512,
    });

    const response = completion.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}