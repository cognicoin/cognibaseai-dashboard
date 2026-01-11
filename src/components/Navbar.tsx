'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo } from 'react';

const ConnectButton = dynamic(
  async () => {
    const mod = await import('@/components/_ConnectButtonClient');
    return mod.default;
  },
  { ssr: false }
);

export default function Navbar() {
  const links = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/dashboard', label: 'Dashboard' }
    ],
    []
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-xl overflow-hidden">
            <Image src="/logo.png" alt="Cogni" fill className="object-contain" priority />
          </div>
          <span className="font-extrabold tracking-tight text-white">
            Cogni<span className="text-cyan-400">Analytics</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
