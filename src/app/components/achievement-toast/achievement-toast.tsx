'use client'

import React, { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { achievementsStore } from '@component/app/achievement-store'
import { playSound } from '@component/app/utils/sounds'

import styles from './achievement-toast.module.scss'

export default function AchievementToast() {
  const toast = useStore(achievementsStore.toast)

  useEffect(() => {
    achievementsStore.load()
  }, [])

  useEffect(() => {
    if (!toast) return
    playSound('claim')
    const id = setTimeout(() => achievementsStore.dismissToast(), 4500)
    return () => clearTimeout(id)
  }, [toast])

  if (!toast) return null

  return (
    <div className={styles.toast} role='status'>
      <span className={styles.badge}>Achievement</span>
      <strong>{toast.title}</strong>
      <span>{toast.message}</span>
    </div>
  )
}
