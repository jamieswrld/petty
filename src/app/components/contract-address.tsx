'use client'

import React, { useState } from 'react'

import { gotchiMintAddress, tokenSymbol } from '@component/app/shared-data/shared-data'
import { playSound } from '@component/app/utils/sounds'

import styles from './contract-address.module.scss'

type Props = {
  className?: string
  variant?: 'default' | 'inline'
}

export default function ContractAddress( { className, variant = 'default' }: Props ) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(gotchiMintAddress)
      playSound('click')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignored
    }
  }

  const short = `${gotchiMintAddress.slice(0, 4)}…${gotchiMintAddress.slice(-4)}`

  return (
    <div className={`${styles.ca} ${variant === 'inline' ? styles['ca--inline'] : ''} ${className ?? ''}`}>
      <span className={styles.label}>{tokenSymbol} CA</span>
      <button type='button' className={styles.address} onClick={copy} title={gotchiMintAddress}>
        {short}
      </button>
      {variant === 'default' && (
        <span className={styles.feedback}>{copied ? 'Copied!' : 'Click to copy'}</span>
      )}
      {variant === 'inline' && copied && (
        <span className={styles['feedback--inline']}>Copied!</span>
      )}
    </div>
  )
}
