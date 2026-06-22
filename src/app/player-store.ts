'use client'

import { atom, action } from 'nanostores'
import { isBrowser, persistToStorage } from '@component/app/utils/storage'

export type AuthType = 'guest' | 'wallet'

export type Player = {
  authType: AuthType
  walletAddress: string | null
  username: string
  createdAt: number
}

export const PLAYER_KEY = 'petana-player'

const store = atom<Player | undefined>(undefined)

store.listen(( value ) =>
  persistToStorage(PLAYER_KEY, value ? JSON.stringify(value) : null),
)

export const playerStore = {
  store,
  tryGetFromLocalStorage: action(store, 'tryGetFromLocalStorage', ( store ) => {
    if (!isBrowser()) return
    try {
      const saved = localStorage.getItem(PLAYER_KEY)
      if (saved) store.set(JSON.parse(saved) as Player)
    } catch (error) {
      //ignored
    }
  }),
  signInGuest: action(store, 'signInGuest', ( store ) => {
    const existing = store.get()
    store.set({
      authType: 'guest',
      walletAddress: null,
      username: existing?.username ?? '',
      createdAt: existing?.createdAt ?? Date.now(),
    })
  }),
  signInWallet: action(store, 'signInWallet', ( store, address: string ) => {
    const existing = store.get()
    store.set({
      authType: 'wallet',
      walletAddress: address,
      username: existing?.username ?? '',
      createdAt: existing?.createdAt ?? Date.now(),
    })
  }),
  setWalletAddress: action(store, 'setWalletAddress', ( store, address: string | null ) => {
    const player = store.get()
    if (!player) return
    store.set({
      ...player,
      walletAddress: address,
      authType: address ? 'wallet' : player.authType,
    })
  }),
  setUsername: action(store, 'setUsername', ( store, username: string ) => {
    const player = store.get()
    if (!player) return
    store.set({ ...player, username })
  }),
  logout: action(store, 'logout', ( store ) => {
    store.set(undefined)
  }),
}
