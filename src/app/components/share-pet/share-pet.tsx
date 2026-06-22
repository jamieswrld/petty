'use client'

import React, { useState } from 'react'

import { Pet } from '@component/app/types/pet'
import { rankForEarned } from '@component/app/shared-data/milestones'
import { playSound } from '@component/app/utils/sounds'
import { sharePetOnX } from '@component/app/utils/share-pet'

import styles from './share-pet.module.scss'

type Props = {
  pet: Pet
  username?: string
}

export default function SharePet( { pet, username }: Props ) {
  const [sharing, setSharing] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const rank = rankForEarned(pet.totalEarned ?? 0)

  const handleShare = async () => {
    setSharing(true)
    setHint(null)
    playSound('click')

    try {
      const result = await sharePetOnX({ pet, username })
      if (result.mode === 'download') {
        setHint('Pet card saved — attach the image to your tweet!')
      } else if (result.mode === 'native') {
        setHint('Shared!')
      }
    } catch {
      setHint('Could not create share image. Try again.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className={styles.share}>
      <button
        type='button'
        className={styles.btn}
        onClick={handleShare}
        disabled={sharing}
        aria-label={`Share ${pet.name} on X, ${rank} rank`}
      >
        <span className={styles['btn--label']}>
          {sharing ? 'Creating card…' : 'Share on X'}
        </span>
        {!sharing && (
          <span className={styles['btn--meta']}>
            {pet.name} · {rank} rank
          </span>
        )}
      </button>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
