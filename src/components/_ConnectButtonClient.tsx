'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

function compact(a?: string) {
  if (!a) return '';
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export default function ConnectButtonClient() {
  const { open } = useAppKit();
  const { isConnected, address } = useAccount();

  return (
    <button
      onClick={() => open()}
      className="px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-cyan-600 text-white hover:scale-[1.03] transition shadow-lg"
    >
      {isConnected ? compact(address) : 'Connect'}
    </button>
  );
}
