// src/lib/groq.ts - SMARTER AI DEGEN SUMMARY (EDUCATED & ACCURATE)
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export interface AiSummary {
  verdict: string;
  bullets: string[];
  degenTip: string;
}

export async function generateSmartDegenSummary(scanResult: any): Promise<AiSummary | null> {
  if (!GROQ_API_KEY) {
    return {
      verdict: '🟡 CAUTION',
      bullets: ['API key missing — set NEXT_PUBLIC_GROQ_API_KEY'],
      degenTip: 'Fix env vars to enable AI summaries',
    };
  }

  try {
    // Extract and format key GoPlus flags
    const flags = [];
    if (scanResult.is_honeypot === '1') flags.push('HONEYPOT DETECTED 🚨');
    if (scanResult.is_mintable === '1') flags.push('MINT FUNCTION (owner can print)');
    if (scanResult.is_proxy === '1') flags.push('PROXY CONTRACT (upgradeable)');
    if (scanResult.blacklist === '1') flags.push('BLACKLIST FUNCTION (can freeze wallets)');
    if (scanResult.lp_locked !== '1') flags.push('LP NOT LOCKED');
    if (scanResult.is_open_source !== '1') flags.push('NOT OPEN SOURCE');

    const noFlags = flags.length === 0 ? 'No major red flags detected' : 'Flags present';

    const prompt = `You are a seasoned crypto analyst who has survived multiple cycles and spotted hundreds of rugs. Your job is to give $COG holders a SMART, EDUCATED assessment of this token based on GoPlus security data.

Key GoPlus flags for this token:
${flags.length > 0 ? flags.join('\n') : noFlags}

Important context you MUST consider:
- Mint functions, blacklist, and proxy are NORMAL on major stablecoins like USDC, USDT, DAI (for compliance and upgrades).
- LP not locked is common on new or small projects.
- Open source is preferred but not always available.
- Honeypot is the biggest red flag.

Analyze calmly and professionally. Give an educated verdict.

Respond in EXACTLY this format:
VERDICT: 🟢 SAFE | 🟡 CAUTION | 🟠 HIGH RISK | 🟥 SCAM
• Bullet 1 (punchy, honest)
• Bullet 2
• Bullet 3
• Bullet 4 (optional)
DEGEN TIP: One actionable tip (e.g., "DCA small", "Wait for audit", "Ape responsibly")

Keep total response under 120 words. Be sharp, not sensational.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6, // Lower for more consistent reasoning
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content) {
      const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const verdict = lines.find((l: string) => l.startsWith('VERDICT:'))?.replace('VERDICT:', '').trim() || '🟡 CAUTION';
      const bullets = lines.filter((l: string) => l.startsWith('•'));
      const degenTip = lines.find((l: string) => l.startsWith('DEGEN TIP:'))?.replace('DEGEN TIP:', '').trim() || 'DYOR always';

      return { verdict, bullets, degenTip };
    }
  } catch (error) {
    console.error('Groq AI error:', error);
  }

  return {
    verdict: '🟡 CAUTION',
    bullets: ['AI summary failed — check connection'],
    degenTip: 'Try again or DYOR manually',
  };
}