'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { petStore } from '@component/app/pet-store'
import { grindStore } from '@component/app/grind-store'
import { WALK_BASE_EARN, WALK_URINE_DRAIN } from '@component/app/shared-data/economy'
import { walkBackgroundList } from '@component/app/shared-data/walkBackgrounds'

import Pet from '@component/app/(game-scope)/game/components/pet/pet'
import Bar from '@component/app/(game-scope)/game/components/bar'
import usePet from '../hooks/usePet'
import PetNotFound from '../components/pet-not-found'

import styles from '@component/app/(game-scope)/walk/walk.module.scss'

function Walk() {
  const pet = usePet()
  const router = useRouter()
  const searchParams = useSearchParams()

  const placeId = searchParams.get('place')
  const place = walkBackgroundList.find(( p ) => p.id === placeId) ?? walkBackgroundList[0]

  useEffect(() => {
    grindStore.tryGetFromLocalStorage()
    grindStore.recordWalk()

    let id: NodeJS.Timeout
    const baseEarn = WALK_BASE_EARN

    function spreadUrine() {
      id = setTimeout(() => {
        const multiplier = grindStore.getWalkMultiplier()
        const earnAmount = Math.max(1, Math.round(baseEarn * multiplier))
        petStore.walk(WALK_URINE_DRAIN)
        petStore.earn(earnAmount)
        spreadUrine()
      }, 1000)
    }

    spreadUrine()

    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (pet && pet.urine === 0) {
      router.push('/game')
    }
  }, [router, pet])

  if (!pet) return <PetNotFound/>

  return (
    <div
      className={styles['walk--container']}
      style={{ background: place.background }}
    >
      <Bar title={`Walking — ${place.name}`} percent={pet.urine}/>
      <Pet image={pet.image} name={pet.name} alt={pet.alt}/>
    </div>
  )
}

export default Walk
