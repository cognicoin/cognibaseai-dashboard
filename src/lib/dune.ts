// src/lib/dune.ts
type DuneExecutionResponse = {
  execution_id?: string;
};

type DuneResultsResponse = {
  state?: string;
  result?: {
    rows?: any[];
  };
};

const DUNE_BASE = 'https://api.dune.com/api/v1';

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function executeAndWait(queryId: number, parameters: Record<string, any>) {
  const apiKey = process.env.DUNE_API_KEY;
  if (!apiKey) throw new Error('DUNE_API_KEY not set');

  const execRes = await fetch(`${DUNE_BASE}/query/${queryId}/execute`, {
    method: 'POST',
    headers: {
      'X-Dune-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parameters }),
  });

  const execData = (await execRes.json()) as DuneExecutionResponse;
  if (!execData?.execution_id) throw new Error('Dune execute failed');

  const executionId = execData.execution_id;

  let last: DuneResultsResponse | null = null;

  for (let i = 0; i < 18; i++) {
    await sleep(2000);
    const res = await fetch(`${DUNE_BASE}/execution/${executionId}/results`, {
      headers: { 'X-Dune-Api-Key': apiKey },
    });
    last = (await res.json()) as DuneResultsResponse;

    if (last?.state === 'QUERY_STATE_COMPLETED') return last?.result?.rows || [];
    if (last?.state === 'QUERY_STATE_FAILED') throw new Error('Dune query failed');
  }

  return last?.result?.rows || [];
}

export async function fetchDuneBundle(tokenAddress: string) {
  const token_address = tokenAddress.toLowerCase();

  // Your query ids from the provided Dune links:
  const QUERY_VOLUME_TRADES = 6492237;
  const QUERY_HOLDERS = 6492243;
  const QUERY_PRICE = 6492286;
  const QUERY_SUMMARY = 6492249;

  const [volumeRows, holderRows, priceRows, summaryRows] = await Promise.allSettled([
    executeAndWait(QUERY_VOLUME_TRADES, { token_address }),
    executeAndWait(QUERY_HOLDERS, { token_address }),
    executeAndWait(QUERY_PRICE, { token_address }),
    executeAndWait(QUERY_SUMMARY, { token_address }),
  ]);

  const safe = (r: PromiseSettledResult<any[]>) => (r.status === 'fulfilled' ? r.value : []);

  return {
    volumeAndTrades: safe(volumeRows),
    holders: safe(holderRows),
    priceChange: safe(priceRows),
    tokenSummary: safe(summaryRows),
  };
}
