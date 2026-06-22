'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@nanostores/react'
import { useWallet } from '@solana/wallet-adapter-react'

import { playerStore } from '@component/app/player-store'
import { petStore } from '@component/app/pet-store'

export default function Profile() {
  const player = useStore(playerStore.store)
  const { connected, disconnect } = useWallet()
  const router = useRouter()

  if (!player?.username) return null

  const shortAddress = player.walletAddress
    ? `${player.walletAddress.slice(0, 4)}…${player.walletAddress.slice(-4)}`
    : null

  const logout = async () => {
    try {
      if (connected) await disconnect()
    } catch (error) {
      //ignored
    }
    petStore.clear()
    playerStore.logout()
    router.push('/')
  }

  return (
    <li className='profile'>
      <span className='profile--name'>{player.username}</span>
      {shortAddress && <span className='profile--wallet'>{shortAddress}</span>}
      <button className='profile--logout' onClick={logout}>Logout</button>
    </li>
  )
}
