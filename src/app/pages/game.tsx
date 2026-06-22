'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { petStore } from '@component/app/pet-store'

import Pet from '@component/app/(game-scope)/game/components/pet/pet'
import ConditionsList from '@component/app/(game-scope)/game/components/conditions-list'
import PlaceToWalkSelector from '../(game-scope)/game/components/place-to-walk-selector/place-to-walk-selector'
import InteractionsList from '@component/app/(game-scope)/game/components/interaction/interactions-list'
import DailyBonus from '../(game-scope)/game/components/daily-bonus/daily-bonus'
import DailyQuest from '../(game-scope)/game/components/daily-quest/daily-quest'
import Rewards from '../(game-scope)/game/components/rewards/rewards'
import MilestoneBar from '../(game-scope)/game/components/milestone-bar/milestone-bar'
import PetNeedsHint from '../(game-scope)/game/components/pet-needs-hint/pet-needs-hint'
import AchievementToast from '../components/achievement-toast/achievement-toast'
import { achievementsStore } from '../achievement-store'
import { grindStore } from '../grind-store'

import { mealList } from '@component/app/shared-data/meals'
import { beverageList } from '@component/app/shared-data/beverages'
import { toyList } from '@component/app/shared-data/toys'

import styles from '../(game-scope)/game/game.module.scss'
import usePet from '../hooks/usePet'
import usePlayer from '../hooks/usePlayer'

export default function Game() {
  const pet = usePet()
  const { player, loaded } = usePlayer()
  const router = useRouter()

  useEffect(() => {
    if (loaded && !player?.username) router.replace('/')
  }, [loaded, player, router])

  useEffect(() => {
    if (loaded && player?.username && !pet) router.replace('/create')
  }, [loaded, player, pet, router])

  useEffect(() => {
    grindStore.tryGetFromLocalStorage()
    achievementsStore.load()
  }, [])

  if (!pet) return null

  return (
    <>
      <AchievementToast/>
      <div
        className={styles['game--container']}
        style={{ background: 'linear-gradient(180deg, #7daffa 0%, #f4bda3 55%, #98D98E 100%)' }}
      >
        <div className={styles['game-hud']}>
          <MilestoneBar totalEarned={pet.totalEarned ?? 0}/>
          <PetNeedsHint pet={pet}/>
        </div>
        <div className={styles['game-body']}>
      <div className={styles['conditions-interactions--container']}>
        <ConditionsList/>
        <div className={styles['interactions--container']}>
          <InteractionsList
            key='meals-list'
            title='Meals'
            array={mealList.filter(( e ) => e.diet === pet.diet)}
            onClick={petStore.eat}
            balance={pet.balance}
          />
          <InteractionsList
            key='beverages-list'
            title='Beverages'
            array={beverageList}
            onClick={petStore.drink}
            balance={pet.balance}
          />
          <InteractionsList
            key='toys-list'
            title='Toys'
            array={toyList}
            onClick={petStore.play}
            balance={pet.balance}
          />
        </div>
      </div>
      <Pet image={pet.image} name={pet.name} alt={pet.alt}/>
      <div className={styles['places--container']}>
        <Image
          src='/game-asset/pet-home.svg'
          alt='Pet home'
          width={200}
          height={208}
          style={{ alignSelf: 'center' }}
        />
        {pet.urine > 50 && <PlaceToWalkSelector/>}
        <DailyQuest/>
        <DailyBonus/>
        <Rewards/>
      </div>
        </div>
    </div>
    </>
  )
}
