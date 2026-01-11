// src/lib/reownConfig.ts
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { base } from '@reown/appkit/networks';

// We support both names to avoid confusion.
// Your Vercel logs show NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_PROJECT_ID ||
  '';

// AppKit expects a non-empty tuple type: [AppKitNetwork, ...AppKitNetwork[]]
export const networks = [base] as unknown as [AppKitNetwork, ...AppKitNetwork[]];

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://cognibaseai.io';

export const metadata = {
  name: 'CogniBase AI',
  description: 'Intelligence-first, token-gated crypto SaaS platform',
  url: siteUrl, // must match your deployed domain
  icons: [`${siteUrl}/icon.png`].filter(Boolean)
};

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || 'disabled',
  networks,
  ssr: true,
  // Cookie storage helps SSR hydration / reduces mismatch issues
  storage: createStorage({
    storage: cookieStorage
  })
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
