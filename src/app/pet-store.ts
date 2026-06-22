'use client'

import { atom, action } from 'nanostores'
import { Pet } from '@component/app/types/pet'
import {
  CARE_DRINK_BONUS,
  CARE_EAT_BONUS,
  CARE_PLAY_FREE_BONUS,
  CARE_PLAY_PAID_BONUS,
  HAPPY_STAT_MIN,
  PET_TAP_EARN,
} from '@component/app/shared-data/economy'
import { notiStore } from './(game-scope)/game/components/noti/store'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export const KEY = 'pet'
export type Field = 'happiness' | 'fullness' | 'thirst'

const store = atom<Pet | undefined>(undefined)

store.listen(( value ) =>
  persistToStorage(KEY, value ? JSON.stringify(value) : null),
)

export const petStore = {
  store,
  tryGetFromLocalStorage: action(store, 'tryGetFromLocalStorage', ( store ) => {
    if (!isBrowser()) return
    try {
      const localPet = localStorage.getItem(KEY)
      if (!localPet) return
      const parsed = JSON.parse(localPet) as Pet
      store.set({ ...parsed, totalEarned: parsed.totalEarned ?? 0 })
    } catch (error) {
      //ignored
    }
  }),
  createPet: action(store, 'createPet', ( store, pet: Pet ) => {
    store.set(pet)
  }),
  reduceNeeds: action(store, 'reduceNeeds', ( store, field: Field ) => {
    const pet = store.get()

    if (!pet) return

    if (pet[field] > 0) {
      const newValue = { ...pet, [field]: pet[field] - 1 }
      store.set(newValue)

      if (newValue[field] < 50) notiStore.add(field)
    } else {
      if (pet[field] < 50) notiStore.add(field)
    }
  }),
  eat: action(store, 'eat', ( store, value: number, price: number ) => {
    const pet = store.get()
    if (pet && pet.balance >= price) {
      const careBonus = CARE_EAT_BONUS
      const newValue = {
        ...pet,
        fullness: pet.fullness + value >= 100 ? 100 : pet.fullness + value,
        balance: pet.balance - price + careBonus,
        totalEarned: ( pet.totalEarned ?? 0 ) + careBonus,
      }
      store.set(newValue)

      notiStore.add('yummy')
      notiStore.remove('fullness')
    }
  }),
  drink: action(store, 'drink', ( store, value: number, price: number ) => {
    const pet = store.get()
    if (pet && pet.balance >= price) {
      const careBonus = CARE_DRINK_BONUS
      const newValue = {
        ...pet,
        thirst: pet.thirst + value >= 100 ? 100 : pet.thirst + value,
        urine: pet.urine + value >= 100 ? 100 : pet.urine + value,
        balance: pet.balance - price + careBonus,
        totalEarned: ( pet.totalEarned ?? 0 ) + careBonus,
      }
      store.set(newValue)

      notiStore.add('yummy')
      notiStore.remove('thirst')

      if (newValue.urine > 50) notiStore.add('pee')
    }
  }),
  walk: action(store, 'walk', ( store, value: number ) => {
    const pet = store.get()
    if (pet) {
      const newUrineValue = Math.max(0, pet.urine - value)
      const newValue = {
        ...pet,
        urine: newUrineValue,
      }
      store.set(newValue)

      if (newUrineValue < 50) notiStore.remove('pee')
    }
  }),
  play: action(store, 'play', ( store, value: number, price: number ) => {
    const pet = store.get()
    if (pet && pet.balance >= price) {
      const careBonus = price === 0 ? CARE_PLAY_FREE_BONUS : CARE_PLAY_PAID_BONUS
      const newValue = {
        ...pet,
        happiness: pet.happiness + value >= 100 ? 100 : pet.happiness + value,
        balance: pet.balance - price + careBonus,
        totalEarned: ( pet.totalEarned ?? 0 ) + careBonus,
      }
      store.set(newValue)

      notiStore.add('play')
      notiStore.remove('happiness')
    }
  }),
  petTap: action(store, 'petTap', ( store ) => {
    const pet = store.get()
    if (!pet) return false

    const bonus = PET_TAP_EARN
    store.set({
      ...pet,
      balance: pet.balance + bonus,
      totalEarned: ( pet.totalEarned ?? 0 ) + bonus,
    })
    notiStore.add('speak')
    return true
  }),
  isHappy: ( pet: Pet ): boolean =>
    pet.happiness >= HAPPY_STAT_MIN && pet.fullness >= HAPPY_STAT_MIN && pet.thirst >= HAPPY_STAT_MIN,
  earn: action(store, 'earn', ( store, value: number ) => {
    const pet = store.get()
    if (pet) {
      const newValue = {
        ...pet,
        balance: pet.balance + value,
        totalEarned: ( pet.totalEarned ?? 0 ) + value,
      }
      store.set(newValue)
    }
  }),
  clear: action(store, 'clear', ( store ) => {
    store.set(undefined)
  }),
}
