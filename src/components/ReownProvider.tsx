// src/components/ReownProvider.tsx
'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'; // Set in .env

const metadata = {
  name: 'Cogni Analytics',
  description: 'Intelligence-First Token-Gated Crypto SaaS Platform',
  url: 'https://yourdomain.com',
  icons: ['https://yourdomain.com/favicon.ico'],
};

const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

createAppKit({
  projectId,
  networks: [base],
  metadata,
  features: {
    analytics: true,
  },
});

export default function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}