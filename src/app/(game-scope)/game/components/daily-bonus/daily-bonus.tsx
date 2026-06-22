'use client'

import React, { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { grindStore } from '@component/app/grind-store'
import { petStore } from '@component/app/pet-store'
import { DAILY_BASE_REWARD, DAILY_STREAK_CAP } from '@component/app/shared-data/economy'
import { playSound } from '@component/app/utils/sounds'

import styles from './daily-bonus.module.scss'

export default function DailyBonus() {
  const grind = useStore(grindStore.store)

  useEffect(() => {
    grindStore.tryGetFromLocalStorage()
    grindStore.syncLoginStreak()
  }, [])

  const canClaim = grindStore.canClaimDaily()
  const streak = grind.loginStreak || 1
  const reward = DAILY_BASE_REWARD * Math.min(streak, DAILY_STREAK_CAP)

  const claim = () => {
    playSound('claim')
    const coins = grindStore.claimDailyBonus()
    if (coins > 0) petStore.earn(coins)
  }

  return (
    <div className={styles.bonus}>
      <div className={styles.header}>
        <span className={styles.streak}>🔥 {streak}-day streak</span>
        {grindStore.getWalkMultiplier() > 1 && (
          <span className={styles.multiplier}>
            Walk {grindStore.getWalkMultiplier().toFixed(2)}×
          </span>
        )}
      </div>
      {canClaim ? (
        <button type='button' className={styles.claim} onClick={claim}>
          Claim daily +{reward} coins
        </button>
      ) : (
        <span className={styles.claimed}>Daily claimed ✓</span>
      )}
    </div>
  )
}
