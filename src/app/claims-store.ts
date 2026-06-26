'use client'

import { atom, action } from 'nanostores'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export type ClaimStatus = 'pending' | 'confirmed' | 'failed' | 'requested'

export type Claim = {
  threshold: number
  reward: string
  tokenPayout?: number
  walletAddress: string
  username: string
  requestedAt: number
  status: ClaimStatus
  signature?: string
  error?: string
}

export const CLAIMS_KEY = 'petgotchi-claims'

const store = atom<Claim[]>([])

store.listen(( value ) => persistToStorage(CLAIMS_KEY, JSON.stringify(value)))

export const claimsStore = {
  store,
  load: action(store, 'load', ( store ) => {
    if (!isBrowser()) return
    try {
      const saved = localStorage.getItem(CLAIMS_KEY)
      if (saved) store.set(JSON.parse(saved) as Claim[])
    } catch {
      //ignored
    }
  }),
  add: action(store, 'add', ( store, claim: Claim ) => {
    const existing = store.get().find(
      ( c ) => c.walletAddress === claim.walletAddress && c.threshold === claim.threshold,
    )
    if (existing) {
      store.set(
        store.get().map(( c ) =>
          c.walletAddress === claim.walletAddress && c.threshold === claim.threshold ? claim : c,
        ),
      )
      return
    }
    store.set([...store.get(), claim])
  }),
  upsert: action(store, 'upsert', ( store, claim: Claim ) => {
    claimsStore.add(claim)
  }),
}
