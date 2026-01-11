// src/lib/goplus.ts
export type GoPlusResult = Record<string, any>;

export async function fetchGoPlusSecurity(chainId: string, contractAddress: string) {
  const addr = contractAddress.trim();

  if (!addr) throw new Error('Missing contract address');

  let url = '';
  if (chainId === 'solana') {
    url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${addr}`;
  } else {
    url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${addr.toLowerCase()}`;
  }

  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();

  // GoPlus responses vary by endpoint
  if (chainId === 'solana') {
    const result = data?.result?.[addr.toLowerCase()] || data?.result || null;
    if (result && Object.keys(result).length > 0) return result;
    throw new Error(data?.message || 'No Solana security data found');
  }

  // EVM format
  if (data?.code === 1 && data?.result) {
    const result = data.result[addr.toLowerCase()];
    if (result && Object.keys(result).length > 0) return result;
  }

  throw new Error(data?.message || 'No security data found');
}
