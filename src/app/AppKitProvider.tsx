// src/app/AppKitProvider.tsx
'use client';

import { createAppKit } from '@reown/appkit/react';
import type { AppKitNetwork } from '@reown/appkit/networks';

import { 
  base, 
  mainnet, 
  arbitrum, 
  optimism, 
  polygon, 
  bsc, 
  avalanche 
} from '@reown/appkit/networks';

import { projectId, wagmiAdapter } from '@/lib/reownConfig';

const networks = [
  base,
  mainnet,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
] as [AppKitNetwork, ...AppKitNetwork[]];

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Cogni Analytics Dashboard',
    description: 'Onchain Intelligence • $COG Holders • Token Scanner & AI Summaries',
    url: 'https://cognibaseai.io',
    icons: ['https://cognibaseai.io/cogni-logo.png'],
  },
  features: {
    email: true,
    socials: ['google', 'github', 'x', 'discord'],
    allWallets: true,
    analytics: true,
  },
  themeMode: 'dark',
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}