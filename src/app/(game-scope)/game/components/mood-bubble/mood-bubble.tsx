'use client'

import React, { useMemo } from 'react'

import type { Pet } from '@component/app/types/pet'
import { getPetMood } from '@component/app/shared-data/pet-needs'

import styles from './mood-bubble.module.scss'

type Props = {
  pet: Pet
}

export default function MoodBubble( { pet }: Props ) {
  const mood = useMemo(
    () => getPetMood(pet),
    [pet.fullness, pet.thirst, pet.happiness, pet.urine, pet],
  )

  return (
    <div className={`${styles.bubble} ${styles[`bubble--${mood.tone}`]}`} role='note'>
      {mood.text}
    </div>
  )
}
