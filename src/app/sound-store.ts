'use client'

import { atom } from 'nanostores'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export const VOLUME_KEY = 'petana-volume'

// localStorage 'true' = muted (matches legacy volume-btn behaviour)
export const soundStore = atom({ muted: false })

export const syncSoundFromStorage = () => {
  if (!isBrowser()) return
  const saved = localStorage.getItem(VOLUME_KEY)
  soundStore.set({ muted: saved === 'true' })
}

export const setMuted = ( muted: boolean ) => {
  persistToStorage(VOLUME_KEY, JSON.stringify(muted))
  soundStore.set({ muted })
}

export const isMuted = (): boolean => soundStore.get().muted
