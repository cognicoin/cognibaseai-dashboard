// src/app/AppKitProvider.tsx - FIXED VERSION
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { base } from 'wagmi/chains';
import { wagmiAdapter } from '@/lib/reownConfig';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  metadata: {
    name: 'Cogni Analytics',
    description: 'Intelligence-First Token-Gated Crypto SaaS Platform',
    url: 'https://cognibase.ai',
    icons: ['https://cognibase.ai/favicon.ico'],
  },
  features: {
    analytics: true,
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}