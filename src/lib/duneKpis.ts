// src/lib/duneKpis.ts
export type DuneKpis = {
  holders?: number | null;
  volume24h?: number | null;
  trades24h?: number | null;
  priceChange24h?: number | null;
  priceChange7d?: number | null;
  liquidityUsd?: number | null;
  mcapUsd?: number | null;
  raw?: any;
};

function toNumber(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v).replace(/[$,%\s,]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickFirstRow(rows: any[]): any | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0] || null;
}

function pickByKeys(row: any, keys: string[]): number | null {
  if (!row) return null;
  for (const k of keys) {
    if (row[k] !== undefined) {
      const n = toNumber(row[k]);
      if (n !== null) return n;
    }
  }
  return null;
}

export function mapDuneBundleToKpis(bundle: any): DuneKpis {
  // bundle: { volumeAndTrades, holders, priceChange, tokenSummary }
  const volumeRow = pickFirstRow(bundle?.volumeAndTrades || []);
  const holderRow = pickFirstRow(bundle?.holders || []);
  const priceRow = pickFirstRow(bundle?.priceChange || []);
  const summaryRow = pickFirstRow(bundle?.tokenSummary || []);

  const holders =
    pickByKeys(holderRow, ['holders', 'holder_count', 'unique_holders', 'count']) ??
    pickByKeys(summaryRow, ['holders', 'holder_count', 'unique_holders']);

  const volume24h =
    pickByKeys(volumeRow, ['volume_24h', 'volume24h', 'volume', 'usd_volume_24h', 'volume_usd_24h']) ??
    pickByKeys(summaryRow, ['volume_24h', 'volume24h', 'volume']);

  const trades24h =
    pickByKeys(volumeRow, ['trades_24h', 'trades24h', 'tx_24h', 'txs_24h', 'swaps_24h']) ??
    pickByKeys(summaryRow, ['trades_24h', 'trades24h', 'tx_24h', 'txs_24h']);

  const priceChange24h =
    pickByKeys(priceRow, ['price_change_24h', 'change_24h', 'pct_change_24h', 'price_change_pct_24h']) ??
    pickByKeys(summaryRow, ['price_change_24h', 'pct_change_24h', 'change_24h']);

  const priceChange7d =
    pickByKeys(priceRow, ['price_change_7d', 'change_7d', 'pct_change_7d', 'price_change_pct_7d']) ??
    pickByKeys(summaryRow, ['price_change_7d', 'pct_change_7d', 'change_7d']);

  const liquidityUsd =
    pickByKeys(summaryRow, ['liquidity_usd', 'liquidity', 'liquidityUSD', 'lp_usd', 'tvl_usd']) ?? null;

  const mcapUsd =
    pickByKeys(summaryRow, ['mcap_usd', 'market_cap', 'marketCap', 'fdv', 'fdv_usd']) ?? null;

  return {
    holders,
    volume24h,
    trades24h,
    priceChange24h,
    priceChange7d,
    liquidityUsd,
    mcapUsd,
    raw: bundle,
  };
}
