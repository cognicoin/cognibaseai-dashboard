// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/reownConfig';

// Optimized QueryClient for dashboard (auto-refresh + caching)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Auto-refetch on window focus/reconnect (perfect for crypto data)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // 5min stale time for token data (balance, staking)
      staleTime: 1000 * 60 * 5,
      // 30min cache time
      gcTime: 1000 * 60 * 30,
      // Retry failed queries 3x
      retry: 3,
      // Network mode for optimistic updates
      networkMode: 'online',
    },
    mutations: {
      // Don't retry failed transactions
      retry: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}