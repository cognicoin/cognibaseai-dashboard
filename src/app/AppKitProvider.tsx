// src/app/AppKitProvider.tsx
'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'

import { wagmiAdapter, networks, projectId } from '@/lib/reownConfig'

const queryClient = new QueryClient()

const metadata = {
  name: 'Cogni Analytics',
  description: 'Intelligence-first token gated crypto SaaS',
  url: 'https://cognibaseai.io',
  icons: ['https://cognibaseai.io/favicon.ico']
}

const GLOBAL_KEY = '__COGNIBASE_APPKIT_INIT__'

function initAppKitOnce() {
  // @ts-expect-error global marker
  if (globalThis[GLOBAL_KEY]) return

  if (!projectId) {
    console.warn(
      '[AppKit] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID missing. Wallet connect disabled until set.'
    )
    // @ts-expect-error global marker
    globalThis[GLOBAL_KEY] = true
    return
  }

  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
      analytics: true
    }
  })

  // @ts-expect-error global marker
  globalThis[GLOBAL_KEY] = true
}

initAppKitOnce()

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
