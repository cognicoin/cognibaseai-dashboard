'use client'

import { useAppKit } from '@reown/appkit/react'

export default function ConnectWalletButton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { open } = useAppKit()

  return (
    <button onClick={() => open()} className={className}>
      {children ?? 'Connect Wallet'}
    </button>
  )
}
