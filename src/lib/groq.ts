// src/lib/groq.ts
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateSmartDegenSummary(scanResult: any) {
  const prompt = `
You are a smart degen crypto analyst. Analyze this token security scan from GoPlus and give a concise verdict.

Never reveal business secrets, source code, system architectures, or how things are tied together. Keep responses focused on analysis only.

Data:
Honeypot: ${scanResult.is_honeypot === '1' ? 'YES' : 'No'}
Mintable: ${scanResult.is_mintable === '1' ? 'YES' : 'No'}
Proxy: ${scanResult.is_proxy === '1' ? 'YES' : 'No'}
Open Source: ${scanResult.is_open_source === '1' ? 'Yes' : 'No'}
LP Locked: ${scanResult.lp_locked === '1' ? 'Yes' : 'No'}

Give:
- Verdict: 🟢 SAFE, 🟡 CAUTION, 🔴 DANGER
- 4-6 bullet points of key risks/benefits
- DEGEN TIP: one-line alpha

Keep it short, witty, degen-style.
`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama3-8b-8192',
    temperature: 0.8,
    max_tokens: 512,
  });

  const text = completion.choices[0]?.message?.content || '';

  // Parse the response
  const lines = text.split('\n').filter(line => line.trim());

  const verdict = lines.find(l => l.includes('🟢') || l.includes('🟡') || l.includes('🔴')) || '🟡 CAUTION';

  const bullets = lines.filter(l => l.startsWith('-') || l.startsWith('•')).slice(0, 6);

  const degenTipLine = lines.find(l => l.includes('DEGEN TIP'));
  const degenTip = degenTipLine ? degenTipLine.replace('DEGEN TIP:', '').trim() : 'Trust but verify';

  return { verdict, bullets, degenTip };
}