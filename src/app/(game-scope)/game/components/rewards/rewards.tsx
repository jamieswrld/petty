'use client'

import React, { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { petStore } from '@component/app/pet-store'
import { playerStore } from '@component/app/player-store'
import { claimsStore } from '@component/app/claims-store'
import { milestones, levelForEarned, nextMilestone, formatThreshold } from '@component/app/shared-data/milestones'
import { playSound } from '@component/app/utils/sounds'
import { claimApiUrl } from '@component/app/utils/claim-api'

import styles from './rewards.module.scss'

type ClaimResponse = {
  ok?: boolean
  signature?: string
  amount?: number
  testMode?: boolean
  explorer?: string
  error?: string
  alreadyClaimed?: boolean
}

export default function Rewards() {
  const pet = useStore(petStore.store)
  const player = useStore(playerStore.store)
  const claims = useStore(claimsStore.store)
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [claimingThreshold, setClaimingThreshold] = useState<number | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [treasuryLive, setTreasuryLive] = useState<boolean | null>(null)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    claimsStore.load()
  }, [])

  useEffect(() => {
    if (connected && publicKey && player && !player.walletAddress) {
      playerStore.setWalletAddress(publicKey.toBase58())
    }
  }, [connected, publicKey, player])

  useEffect(() => {
    fetch(claimApiUrl('/api/treasury/claim'))
      .then(( r ) => r.json())
      .then(( data ) => {
        setTreasuryLive(Boolean(data.configured))
        setTestMode(Boolean(data.testMode))
      })
      .catch(() => setTreasuryLive(false))
  }, [])

  if (!pet || !player) return null

  const totalEarned = pet.totalEarned ?? 0
  const level = levelForEarned(totalEarned)
  const upcoming = nextMilestone(totalEarned)

  const progress = upcoming
    ? Math.min(100, Math.round(( totalEarned / upcoming.threshold ) * 100))
    : 100

  const claimForWallet = ( threshold: number ) =>
    claims.find(
      ( c ) => c.walletAddress === player.walletAddress && c.threshold === threshold,
    )

  const claim = async ( threshold: number, reward: string, tokenPayout?: number ) => {
    if (!tokenPayout) return
    if (!player.walletAddress) {
      playSound('click')
      setVisible(true)
      return
    }

    setClaimError(null)
    setClaimingThreshold(threshold)
    playSound('claim')

    const pendingClaim = {
      threshold,
      reward,
      tokenPayout,
      walletAddress: player.walletAddress,
      username: player.username,
      requestedAt: Date.now(),
      status: 'pending' as const,
    }
    claimsStore.upsert(pendingClaim)

    try {
      const res = await fetch(claimApiUrl('/api/treasury/claim'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: player.walletAddress,
          threshold,
          username: player.username,
          totalEarned,
        }),
      })

      const data = await res.json() as ClaimResponse

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed')
      }

      claimsStore.upsert({
        ...pendingClaim,
        status: 'confirmed',
        signature: data.signature,
        tokenPayout: data.amount ?? tokenPayout,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Claim failed'
      setClaimError(message)
      claimsStore.upsert({
        ...pendingClaim,
        status: treasuryLive === false ? 'requested' : 'failed',
        error: message,
      })
    } finally {
      setClaimingThreshold(null)
    }
  }

  return (
    <div className={styles.rewards}>
      <div className={styles.header}>
        <h3>Rewards</h3>
        <span className={styles.level}>Level {level}</span>
      </div>

      {testMode && (
        <p className={styles['test--banner']}>Test mode: claims pay 1 $Petgotchi each</p>
      )}

      {treasuryLive === false && (
        <p className={styles['offline--banner']}>
          On-chain payouts need the server treasury. Your claim will be saved locally until live.
        </p>
      )}

      {claimError && <p className={styles['claim--error']}>{claimError}</p>}

      <div className={styles.earned}>
        Lifetime earned: <strong>{formatThreshold(totalEarned)}</strong>
      </div>

      <div className={styles['progress--track']}>
        <div className={styles['progress--fill']} style={{ width: `${progress}%` }}/>
      </div>
      <p className={styles['progress--label']}>
        {upcoming
          ? `${formatThreshold(totalEarned)}/${formatThreshold(upcoming.threshold)} to ${upcoming.reward}`
          : 'All milestones unlocked!'}
      </p>

      {!player.walletAddress && (
        <button className={styles['connect--btn']} onClick={() => {
          playSound('click')
          setVisible(true)
        }}>
          Connect wallet to claim $Petgotchi
        </button>
      )}

      <ul className={styles['milestone--list']}>
        {milestones.map(( m ) => {
          const unlocked = totalEarned >= m.threshold
          const record = player.walletAddress ? claimForWallet(m.threshold) : undefined
          const hasToken = m.tokenPayout != null
          const isClaiming = claimingThreshold === m.threshold
          return (
            <li key={m.threshold} className={styles.milestone}>
              <span className={styles['milestone--label']}>
                {m.reward}{' '}
                <span className={styles['milestone--threshold']}>
                  ({formatThreshold(m.threshold)} coins)
                </span>
                {hasToken && (
                  <span className={styles['milestone--token']}>
                    {formatThreshold(m.tokenPayout!)} $Petgotchi
                  </span>
                )}
              </span>
              {!hasToken ? (
                unlocked ? (
                  <span className={styles['milestone--level']}>Unlocked ✓</span>
                ) : (
                  <span className={styles['milestone--locked']}>Locked</span>
                )
              ) : record?.status === 'confirmed' ? (
                <span className={styles['milestone--claimed']}>
                  Sent ✓
                  {record.signature && (
                    <a
                      className={styles['tx--link']}
                      href={`https://solscan.io/tx/${record.signature}`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      View tx
                    </a>
                  )}
                </span>
              ) : record?.status === 'requested' ? (
                <span className={styles['milestone--claimed']}>Requested ✓</span>
              ) : record?.status === 'failed' ? (
                <button
                  className={styles['milestone--claim']}
                  onClick={() => claim(m.threshold, m.reward, m.tokenPayout)}
                  disabled={isClaiming}
                >
                  Retry
                </button>
              ) : unlocked ? (
                <button
                  className={styles['milestone--claim']}
                  onClick={() => claim(m.threshold, m.reward, m.tokenPayout)}
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Sending…' : 'Claim'}
                </button>
              ) : (
                <span className={styles['milestone--locked']}>Locked</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
