'use client'

import { atom, action } from 'nanostores'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export type AchievementId =
  | 'first_walk'
  | 'first_daily'
  | 'first_care'
  | 'first_pet_tap'

export type Achievement = {
  id: AchievementId
  title: string
  message: string
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_walk: {
    id: 'first_walk',
    title: 'First steps!',
    message: 'You completed your first walk.',
  },
  first_daily: {
    id: 'first_daily',
    title: 'Daily grinder',
    message: 'You claimed your first daily bonus.',
  },
  first_care: {
    id: 'first_care',
    title: 'Good parent',
    message: 'You fed or cared for your pet.',
  },
  first_pet_tap: {
    id: 'first_pet_tap',
    title: 'Best friends',
    message: 'You petted your companion for the first time.',
  },
}

export const ACHIEVEMENTS_KEY = 'petana-achievements'

const unlockedStore = atom<AchievementId[]>([])
const toastStore = atom<Achievement | null>(null)

unlockedStore.listen(( value ) =>
  persistToStorage(ACHIEVEMENTS_KEY, JSON.stringify(value)),
)

export const achievementsStore = {
  store: unlockedStore,
  toast: toastStore,
  load: action(unlockedStore, 'load', ( store ) => {
    if (!isBrowser()) return
    try {
      const saved = localStorage.getItem(ACHIEVEMENTS_KEY)
      if (saved) store.set(JSON.parse(saved) as AchievementId[])
    } catch {
      //ignored
    }
  }),
  has: ( id: AchievementId ) => unlockedStore.get().includes(id),
  unlock: action(unlockedStore, 'unlock', ( store, id: AchievementId ) => {
    if (store.get().includes(id)) return false
    store.set([...store.get(), id])
    toastStore.set(ACHIEVEMENTS[id])
    return true
  }),
  dismissToast: action(toastStore, 'dismissToast', ( store ) => {
    store.set(null)
  }),
}
