'use client'

import { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { notiStore } from './store'

import styles from './noti.module.scss'

const removeAfter = 5000

export default function Noti() {
  const currentNoti = useStore(notiStore.currentNotiStore)

  useEffect(() => {
    if (!currentNoti) return

    const id = setTimeout(() => {
      notiStore.removeFirst()
    }, removeAfter)

    return () => clearTimeout(id)
  }, [currentNoti])

  if (!currentNoti) return null

  return (
    <div className={styles.noti} aria-live='polite'>
      {currentNoti.element}
    </div>
  )
}
