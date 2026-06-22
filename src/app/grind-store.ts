'use client'

import { atom, action } from 'nanostores'
import {
  DAILY_BASE_REWARD,
  DAILY_STREAK_CAP,
  WALK_STREAK_BONUS,
  PET_TAP_DAILY_LIMIT,
} from '@component/app/shared-data/economy'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export const GRIND_KEY = 'petana-grind'

export type GrindState = {
  lastLoginDate: string | null
  loginStreak: number
  lastDailyClaimDate: string | null
  walksToday: number
  lastWalkDate: string | null
  petTapsToday: number
  lastPetTapDate: string | null
}

const todayKey = () => new Date().toISOString().slice(0, 10)

const defaultState = (): GrindState => ({
  lastLoginDate: null,
  loginStreak: 0,
  lastDailyClaimDate: null,
  walksToday: 0,
  lastWalkDate: null,
  petTapsToday: 0,
  lastPetTapDate: null,
})

const store = atom<GrindState>(defaultState())

store.listen(( value ) =>
  persistToStorage(GRIND_KEY, JSON.stringify(value)),
)

const daysBetween = ( a: string, b: string ) => {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.round(ms / ( 1000 * 60 * 60 * 24 ))
}

export const grindStore = {
  store,
  tryGetFromLocalStorage: action(store, 'tryGetFromLocalStorage', ( store ) => {
    if (!isBrowser()) return
    try {
      const saved = localStorage.getItem(GRIND_KEY)
      if (saved) store.set(JSON.parse(saved) as GrindState)
    } catch (error) {
      //ignored
    }
  }),
  syncLoginStreak: action(store, 'syncLoginStreak', ( store ) => {
    const state = store.get()
    const today = todayKey()

    if (state.lastLoginDate === today) return

    let streak = state.loginStreak
    if (state.lastLoginDate) {
      const gap = daysBetween(state.lastLoginDate, today)
      streak = gap === 1 ? streak + 1 : 1
    } else {
      streak = 1
    }

    store.set({
      ...state,
      lastLoginDate: today,
      loginStreak: streak,
      walksToday: state.lastWalkDate === today ? state.walksToday : 0,
      petTapsToday: state.lastPetTapDate === today ? state.petTapsToday : 0,
    })
  }),
  claimDailyBonus: action(store, 'claimDailyBonus', ( store ) => {
    const state = store.get()
    const today = todayKey()
    if (state.lastDailyClaimDate === today) return 0

    const streak = Math.min(state.loginStreak || 1, DAILY_STREAK_CAP)
    const reward = DAILY_BASE_REWARD * streak

    store.set({ ...state, lastDailyClaimDate: today })
    return reward
  }),
  canClaimDaily: (): boolean => {
    const state = store.get()
    return state.lastDailyClaimDate !== todayKey()
  },
  getWalkMultiplier: (): number => {
    const streak = Math.min(store.get().loginStreak || 1, DAILY_STREAK_CAP)
    return 1 + streak * WALK_STREAK_BONUS
  },
  recordWalk: action(store, 'recordWalk', ( store ) => {
    const state = store.get()
    const today = todayKey()
    store.set({
      ...state,
      walksToday: state.lastWalkDate === today ? state.walksToday + 1 : 1,
      lastWalkDate: today,
    })
  }),
  canPetTap: (): boolean => {
    const state = store.get()
    const today = todayKey()
    const taps = state.lastPetTapDate === today ? state.petTapsToday : 0
    return taps < PET_TAP_DAILY_LIMIT
  },
  recordPetTap: action(store, 'recordPetTap', ( store ) => {
    const state = store.get()
    const today = todayKey()
    const taps = state.lastPetTapDate === today ? state.petTapsToday : 0
    store.set({
      ...state,
      petTapsToday: taps + 1,
      lastPetTapDate: today,
    })
  }),
  getPetTapsRemaining: (): number => {
    const state = store.get()
    const today = todayKey()
    const taps = state.lastPetTapDate === today ? state.petTapsToday : 0
    return Math.max(0, PET_TAP_DAILY_LIMIT - taps)
  },
}
