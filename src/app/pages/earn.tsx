import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { earnMethods } from '@component/app/shared-data/earn-methods'
import { milestones, formatThreshold } from '@component/app/shared-data/milestones'
import { logoPath } from '@component/app/shared-data/shared-data'

import styles from '@component/app/earn/earn.module.scss'

export default function Earn() {
  return (
    <div className={styles['earn--container']}>
      <div className={styles['earn--intro']}>
        <Image className='petana-logo' src={logoPath} alt='Petana logo' width={56} height={56}/>
        <h1>How to Earn</h1>
        <p>
          Petana is built for grinders. Coins fuel your pet&apos;s care loop and stack toward
          milestone rewards. Here is every way to earn.
        </p>
      </div>

      <ul className={styles['method--list']}>
        {earnMethods.map(( method ) => (
          <li key={method.id} className={styles.method}>
            <div className={styles['method--header']}>
              <h2>{method.title}</h2>
              <span className={styles['method--coins']}>{method.coins}</span>
            </div>
            <p>{method.description}</p>
            {method.tip && <p className={styles.tip}>{method.tip}</p>}
          </li>
        ))}
      </ul>

      <section className={styles['milestones--section']}>
        <h2>Milestone tiers</h2>
        <p>Lifetime coins earned unlock tiers. Sprout, Bronze, and Silver each pay 500 $Petana; Gold pays 1,500 and Diamond pays 3,000. Connect a Solana wallet in-game to claim.</p>
        <ul className={styles['tier--list']}>
          {milestones.map(( m ) => (
            <li key={m.threshold}>
              <strong>{m.reward}</strong> — {formatThreshold(m.threshold)} lifetime coins
              {m.tokenPayout != null && (
                <span> · claim {formatThreshold(m.tokenPayout)} $Petana</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actions}>
        <Link href='/game' className={styles['play--link']}>
          <Image src='/buttons/play-btn.svg' alt='Play' width={160} height={66}/>
        </Link>
        <Link href='/about' className={styles['about--link']}>Who made this?</Link>
      </div>
    </div>
  )
}
