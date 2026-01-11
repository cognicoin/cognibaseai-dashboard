// src/lib/riskScore.ts
import type { DuneKpis } from '@/lib/duneKpis';

export type RiskVerdict = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';

export function computeRiskScore(goPlus: any, kpis?: DuneKpis | null) {
  // Base score starts at 100 and we subtract for risks
  let score = 100;
  const reasons: string[] = [];

  const flag = (cond: boolean, penalty: number, reason: string) => {
    if (!cond) return;
    score -= penalty;
    reasons.push(reason);
  };

  // GoPlus core flags (primary)
  flag(goPlus?.is_honeypot === '1', 50, 'Honeypot flagged');
  flag(goPlus?.is_mintable === '1', 18, 'Mintable token (supply risk)');
  flag(goPlus?.is_proxy === '1', 10, 'Proxy contract (upgrade risk)');
  flag(goPlus?.is_open_source !== '1', 8, 'Contract not open source');
  flag(goPlus?.lp_locked !== '1', 10, 'LP not locked');

  // Taxes (if present)
  const buyTax = Number(goPlus?.buy_tax ?? 0);
  const sellTax = Number(goPlus?.sell_tax ?? 0);
  if (Number.isFinite(buyTax) && buyTax >= 10) {
    score -= 10;
    reasons.push(`High buy tax (${buyTax}%)`);
  }
  if (Number.isFinite(sellTax) && sellTax >= 10) {
    score -= 15;
    reasons.push(`High sell tax (${sellTax}%)`);
  }

  // Ownership controls (if present)
  flag(goPlus?.can_take_back_ownership === '1', 10, 'Owner can reclaim ownership');
  flag(goPlus?.owner_change_balance === '1', 12, 'Owner can change balances');
  flag(goPlus?.hidden_owner === '1', 12, 'Hidden owner risk');

  // Dune context (supporting only)
  if (kpis) {
    if (typeof kpis.holders === 'number' && kpis.holders < 200) {
      score -= 8;
      reasons.push('Low holder count');
    }
    if (typeof kpis.volume24h === 'number' && kpis.volume24h < 5000) {
      score -= 6;
      reasons.push('Low 24h volume');
    }
    if (typeof kpis.priceChange24h === 'number' && Math.abs(kpis.priceChange24h) > 50) {
      score -= 6;
      reasons.push('High 24h volatility');
    }
  }

  score = Math.max(0, Math.min(100, score));

  const verdict: RiskVerdict =
    score >= 80 ? 'LOW RISK' : score >= 55 ? 'MEDIUM RISK' : 'HIGH RISK';

  return {
    score,
    verdict,
    reasons: reasons.slice(0, 6),
  };
}
