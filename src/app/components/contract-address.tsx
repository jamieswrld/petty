'use client'

import React, { useState } from 'react'

import { petgotchiMintAddress } from '@component/app/shared-data/shared-data'
import { playSound } from '@component/app/utils/sounds'

import styles from './contract-address.module.scss'

type Props = {
  className?: string
}

export default function ContractAddress( { className }: Props ) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(petgotchiMintAddress)
      playSound('click')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignored
    }
  }

  const short = `${petgotchiMintAddress.slice(0, 4)}…${petgotchiMintAddress.slice(-4)}`

  return (
    <div className={`${styles.ca} ${className ?? ''}`}>
      <span className={styles.label}>$Petgotchi CA</span>
      <button type='button' className={styles.address} onClick={copy} title={petgotchiMintAddress}>
        {short}
      </button>
      <span className={styles.feedback}>{copied ? 'Copied!' : 'Click to copy'}</span>
    </div>
  )
}
