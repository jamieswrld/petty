'use client'

import React, { useEffect, useState } from 'react'

import { tokenSymbol } from '@component/app/shared-data/shared-data'

import styles from './treasury-status.module.scss'

type TreasuryStatus = {
  configured: boolean
  address: string
  solBalance: number
  gotchiMint: string | null
  gotchiBalance: number | null
  rpc: string
}

const short = ( addr: string ) =>
  addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '—'

export default function TreasuryStatus() {
  const [status, setStatus] = useState<TreasuryStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/treasury/status')
      .then(async ( r ) => {
        const type = r.headers.get('content-type') ?? ''
        if (!r.ok || !type.includes('application/json')) {
          setError('Could not load treasury')
          return
        }
        return r.json()
      })
      .then(( data ) => {
        if (!data) return
        if (data.error) setError(data.error)
        else setStatus(data as TreasuryStatus)
      })
      .catch(() => setError('Could not load treasury'))
  }, [])

  if (error) return null
  if (!status?.address) return null

  return (
    <div className={styles.treasury}>
      <div className={styles.header}>
        <span className={styles.label}>Treasury</span>
        <span className={status.configured ? styles.live : styles.pending}>
          {status.configured ? 'Live' : 'View only'}
        </span>
      </div>
      <p className={styles.address} title={status.address}>
        {short(status.address)}
      </p>
      <div className={styles.balances}>
        <span>{status.solBalance.toFixed(4)} SOL</span>
        {status.gotchiMint && status.gotchiBalance != null && (
          <span>{status.gotchiBalance.toLocaleString()} {tokenSymbol}</span>
        )}
      </div>
    </div>
  )
}
