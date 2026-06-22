'use client'

import React from 'react'

import type { Pet } from '@component/app/types/pet'
import { getPetNeed } from '@component/app/shared-data/pet-needs'

import styles from './pet-needs-hint.module.scss'

type Props = {
  pet: Pet
}

export default function PetNeedsHint( { pet }: Props ) {
  const need = getPetNeed(pet)
  if (!need) return null

  return (
    <div className={styles.hint} role='status'>
      <strong>{need.message}</strong>
      <span>{need.action}</span>
    </div>
  )
}
