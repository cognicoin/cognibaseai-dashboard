// src/lib/reownConfig.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { base, mainnet, arbitrum, optimism, polygon, bsc, avalanche } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Please add it to your .env.local file.');
}

// Add more networks to support the multi-chain scanner on the dashboard
export const networks = [
  base,        // Primary chain for $COG
  mainnet,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
  // Add more if needed later (e.g. fantom, gnosis, etc.)
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage, // Persistent wallet connection across tabs & sessions
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;