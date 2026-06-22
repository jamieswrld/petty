'use client'

import React, { useState } from 'react'

import { petanaMintAddress } from '@component/app/shared-data/shared-data'
import { playSound } from '@component/app/utils/sounds'

import styles from './contract-address.module.scss'

type Props = {
  className?: string
}

export default function ContractAddress( { className }: Props ) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(petanaMintAddress)
      playSound('click')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignored
    }
  }

  const short = `${petanaMintAddress.slice(0, 4)}…${petanaMintAddress.slice(-4)}`

  return (
    <div className={`${styles.ca} ${className ?? ''}`}>
      <span className={styles.label}>$Petana CA</span>
      <button type='button' className={styles.address} onClick={copy} title={petanaMintAddress}>
        {short}
      </button>
      <span className={styles.feedback}>{copied ? 'Copied!' : 'Click to copy'}</span>
    </div>
  )
}
