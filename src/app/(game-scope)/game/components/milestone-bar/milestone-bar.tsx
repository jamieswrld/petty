'use client'

import React from 'react'

import { nextMilestone, formatThreshold } from '@component/app/shared-data/milestones'

import styles from './milestone-bar.module.scss'

type Props = {
  totalEarned: number
}

export default function MilestoneBar( { totalEarned }: Props ) {
  const upcoming = nextMilestone(totalEarned)
  const progress = upcoming
    ? Math.min(100, Math.round(( totalEarned / upcoming.threshold ) * 100))
    : 100

  return (
    <div className={styles.bar}>
      <div className={styles.header}>
        <span className={styles.label}>
          {upcoming ? `Next: ${upcoming.reward}` : 'Max tier reached'}
        </span>
        {upcoming && (
          <span className={styles.count}>
            {formatThreshold(totalEarned)} / {formatThreshold(upcoming.threshold)}
          </span>
        )}
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }}/>
      </div>
    </div>
  )
}
