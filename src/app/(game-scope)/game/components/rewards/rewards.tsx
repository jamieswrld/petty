'use client'

import React, { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { petStore } from '@component/app/pet-store'
import { playerStore } from '@component/app/player-store'
import { claimsStore } from '@component/app/claims-store'
import { milestones, levelForEarned, nextMilestone, formatThreshold } from '@component/app/shared-data/milestones'
import { playSound } from '@component/app/utils/sounds'

import styles from './rewards.module.scss'

export default function Rewards() {
  const pet = useStore(petStore.store)
  const player = useStore(playerStore.store)
  const claims = useStore(claimsStore.store)
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    claimsStore.load()
  }, [])

  useEffect(() => {
    if (connected && publicKey && player && !player.walletAddress) {
      playerStore.setWalletAddress(publicKey.toBase58())
    }
  }, [connected, publicKey, player])

  if (!pet || !player) return null

  const totalEarned = pet.totalEarned ?? 0
  const level = levelForEarned(totalEarned)
  const upcoming = nextMilestone(totalEarned)

  const progress = upcoming
    ? Math.min(100, Math.round(( totalEarned / upcoming.threshold ) * 100))
    : 100

  const claimedThresholds = new Set(
    claims
      .filter(( c ) => player.walletAddress && c.walletAddress === player.walletAddress)
      .map(( c ) => c.threshold),
  )

  const claim = ( threshold: number, reward: string, tokenPayout?: number ) => {
    if (!tokenPayout) return
    if (!player.walletAddress) {
      playSound('click')
      setVisible(true)
      return
    }
    playSound('claim')
    claimsStore.add({
      threshold,
      reward,
      tokenPayout,
      walletAddress: player.walletAddress,
      username: player.username,
      requestedAt: Date.now(),
      status: 'requested',
    })
  }

  return (
    <div className={styles.rewards}>
      <div className={styles.header}>
        <h3>Rewards</h3>
        <span className={styles.level}>Level {level}</span>
      </div>

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
          Connect wallet to claim $Petana
        </button>
      )}

      <ul className={styles['milestone--list']}>
        {milestones.map(( m ) => {
          const unlocked = totalEarned >= m.threshold
          const claimed = claimedThresholds.has(m.threshold)
          const hasToken = m.tokenPayout != null
          return (
            <li key={m.threshold} className={styles.milestone}>
              <span className={styles['milestone--label']}>
                {m.reward}{' '}
                <span className={styles['milestone--threshold']}>
                  ({formatThreshold(m.threshold)} coins)
                </span>
                {hasToken && (
                  <span className={styles['milestone--token']}>
                    {formatThreshold(m.tokenPayout!)} $Petana
                  </span>
                )}
              </span>
              {!hasToken ? (
                unlocked ? (
                  <span className={styles['milestone--level']}>Unlocked ✓</span>
                ) : (
                  <span className={styles['milestone--locked']}>Locked</span>
                )
              ) : claimed ? (
                <span className={styles['milestone--claimed']}>Requested ✓</span>
              ) : unlocked ? (
                <button
                  className={styles['milestone--claim']}
                  onClick={() => claim(m.threshold, m.reward, m.tokenPayout)}
                >
                  Claim
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
