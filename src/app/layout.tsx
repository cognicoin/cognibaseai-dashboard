// src/app/layout.tsx - COMPLETE FINAL LAYOUT WITH UNLOCK CHECKOUT SCRIPT
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppKitProvider } from './AppKitProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CogniBaseAI - Intelligence-First Crypto Analytics',
  description: 'Token-gated dashboard with GoPlus scanner, Groq AI summaries, and $COG staking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Unlock Protocol Checkout Script - Required for subscription buttons */}
        <script src="https://pay.unlock-protocol.com/checkout.js" async></script>
      </head>
      <body className={inter.className + " bg-black text-white"}>
        <AppKitProvider>
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
}