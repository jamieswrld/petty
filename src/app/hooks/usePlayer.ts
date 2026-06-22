'use client'

import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import { playerStore } from '../player-store'

export default function usePlayer() {
  const player = useStore(playerStore.store)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    playerStore.tryGetFromLocalStorage()
    setLoaded(true)
  }, [])

  return { player, loaded }
}
