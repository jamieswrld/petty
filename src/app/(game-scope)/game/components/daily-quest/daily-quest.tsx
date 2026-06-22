'use client'

import React, { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { grindStore } from '@component/app/grind-store'
import { petStore } from '@component/app/pet-store'
import { questForToday } from '@component/app/shared-data/daily-quest'
import { playSound } from '@component/app/utils/sounds'

import styles from './daily-quest.module.scss'

export default function DailyQuest() {
  const grind = useStore(grindStore.store)
  const quest = questForToday()
  const today = new Date().toISOString().slice(0, 10)
  const claimed = grind.lastQuestClaimDate === today
  const complete = grindStore.isQuestComplete(quest.id)
  const canClaim = grindStore.canClaimQuest(quest.id)

  useEffect(() => {
    grindStore.tryGetFromLocalStorage()
    grindStore.syncLoginStreak()
  }, [])

  const claim = () => {
    playSound('claim')
    const coins = grindStore.claimQuest(quest.id, quest.reward)
    if (coins > 0) petStore.earn(coins)
  }

  const progressLabel = () => {
    if (quest.id === 'walk') {
      const walks = grind.lastWalkDate === today ? grind.walksToday : 0
      return `${Math.min(walks, 1)}/1 walks`
    }
    if (quest.id === 'daily') {
      return grind.lastDailyClaimDate === today ? '1/1 claimed' : '0/1 claimed'
    }
    const care = grind.lastCareDate === today ? grind.careActionsToday : 0
    return `${Math.min(care, 3)}/3 care actions`
  }

  return (
    <div className={styles.quest}>
      <div className={styles.header}>
        <span className={styles.title}>Daily quest</span>
        <span className={styles.reward}>+{quest.reward} coins</span>
      </div>
      <p className={styles.label}>{quest.label}</p>
      <p className={styles.progress}>{progressLabel()}</p>
      {claimed ? (
        <span className={styles.done}>Quest complete ✓</span>
      ) : canClaim ? (
        <button type='button' className={styles.claim} onClick={claim}>
          Claim quest reward
        </button>
      ) : (
        <span className={styles.pending}>
          {complete ? 'Ready to claim!' : 'In progress…'}
        </span>
      )}
    </div>
  )
}
