// src/lib/reownConfig.ts
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

/**
 * IMPORTANT:
 * - This file MUST be safe to import during Next.js build / prerender
 * - Do NOT throw if env vars are missing
 */

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

if (!projectId) {
  console.warn(
    '[Cogni] Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. ' +
      'Wallet connections will be disabled until this is set.'
  );
}

export const wagmiAdapter = {
  wagmiConfig: createConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
    connectors: projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: 'Cogni Analytics',
              description: 'Token-gated crypto intelligence platform',
              url: 'https://cognibaseai.io',
              icons: ['https://cognibaseai.io/favicon.ico'],
            },
          }),
        ]
      : [],
  }),
};
