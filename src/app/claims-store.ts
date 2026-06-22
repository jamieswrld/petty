'use client'

import { atom, action } from 'nanostores'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export type Claim = {
  threshold: number
  reward: string
  tokenPayout?: number
  walletAddress: string
  username: string
  requestedAt: number
  status: 'requested'
}

export const CLAIMS_KEY = 'petana-claims'

const store = atom<Claim[]>([])

store.listen(( value ) => persistToStorage(CLAIMS_KEY, JSON.stringify(value)))

export const claimsStore = {
  store,
  load: action(store, 'load', ( store ) => {
    if (!isBrowser()) return
    try {
      const saved = localStorage.getItem(CLAIMS_KEY)
      if (saved) store.set(JSON.parse(saved) as Claim[])
    } catch (error) {
      //ignored
    }
  }),
  add: action(store, 'add', ( store, claim: Claim ) => {
    store.set([...store.get(), claim])
  }),
}
