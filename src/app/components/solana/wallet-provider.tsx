'use client'

import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

/**
 * Wraps the app with Solana wallet context. Wallets that implement the
 * Wallet Standard (Phantom, Solflare, Backpack, ...) auto-register, so we
 * don't need to hard-code an adapter list.
 *
 * autoConnect is disabled on non-secure pages (HTTP GitHub Pages) — it throws
 * and breaks the whole app before images or gameplay can render.
 */
export default function SolanaProvider( { children }: { children: React.ReactNode } ) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta'),
    [],
  )

  const canAutoConnect =
    typeof window !== 'undefined' && window.isSecureContext

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect={canAutoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
