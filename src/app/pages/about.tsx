import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import styles from '@component/app/about/about.module.scss'
import { logoPath } from '@component/app/shared-data/shared-data'

export default function About() {
  return (
    <div className={styles['about--container']}>
      <div className={styles['about--hero']}>
        <Image src={logoPath} alt='Petana logo' width={64} height={64}/>
        <p className={styles.heading}>We are memecoin traders who wanted a Tamagotchi.</p>
      </div>

      <div className={styles['about--text']}>
        <p>
          Petana started on a degen group chat. We were up late watching charts, swapping bags,
          and someone said: &ldquo;What if we had a Tamagotchi that actually rewarded the grind?&rdquo;
        </p>
        <p>
          So we shipped it. Petana is a pixel pet you raise, care for, and earn coins with —
          the same loop we already live as traders, just cuter and with fewer liquidation emails.
        </p>
        <p>
          Feed your pet, keep stats up, walk them when nature calls, stack daily streaks, and
          grind toward milestone rewards. Connect a Solana wallet when you are ready to claim.
        </p>
        <p>
          No VC deck. No roadmap PDF. Just a bunch of memecoin traders who wanted something
          wholesome to grind between candles. Welcome to <span style={{ fontWeight: 'bolder' }}>Petana</span>.
        </p>
      </div>

      <div className={styles['about--links']}>
        <Link href='/earn' className={styles['text--link']}>How to earn →</Link>
        <Link href='/game' className={styles['play--link']}>
          <Image
            className={styles['play--image']}
            src='/buttons/play-btn.svg'
            alt='Play'
            width={160}
            height={66}
          />
        </Link>
      </div>
    </div>
  )
}
