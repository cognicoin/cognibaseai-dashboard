// src/lib/reownConfig.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { base } from '@reown/appkit/networks'

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

// MUST be a non-empty tuple for AppKit (not a normal array)
export const networks = [base] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})
