'use client'

import React, { useEffect, useRef, memo } from 'react'
import gsap from 'gsap'

import { onAction } from 'nanostores'
import { petStore } from '@component/app/pet-store'
import { grindStore } from '@component/app/grind-store'
import { achievementsStore } from '@component/app/achievement-store'

import Noti from '../noti/noti'
import MoodBubble from '../mood-bubble/mood-bubble'
import { notiStore } from '../noti/store'
import AnimatedBreathing from '@component/app/components/animations/animated-breathing'

import styles from '@component/app/(game-scope)/game/game.module.scss'
import { useGSAP } from '@gsap/react'
import { useStore } from '@nanostores/react'
import {
  DECAY_INTERVAL_MS,
  HAPPY_BONUS_EARN,
  HAPPY_BONUS_INTERVAL_MS,
} from '@component/app/shared-data/economy'

type PetProps = {
  image: string
  name: string
  alt: string
}

function Pet( { image, name, alt }: PetProps ) {
  const petRef = useRef<HTMLDivElement>(null)
  const pet = useStore(petStore.store)
  const { contextSafe } = useGSAP({ scope: petRef })

  useEffect(() => {
    let id: NodeJS.Timeout
    const reduceNeeds = () => {
      id = setTimeout(() => {
        petStore.reduceNeeds('happiness')
        petStore.reduceNeeds('fullness')
        petStore.reduceNeeds('thirst')
        reduceNeeds()
      }, DECAY_INTERVAL_MS)
    }
    reduceNeeds()
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    let id: NodeJS.Timeout
    const happyBonus = () => {
      id = setTimeout(() => {
        const pet = petStore.store.get()
        if (pet && petStore.isHappy(pet)) petStore.earn(HAPPY_BONUS_EARN)
        happyBonus()
      }, HAPPY_BONUS_INTERVAL_MS)
    }
    happyBonus()
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    function sayLoveYou() {
      id = setTimeout(() => {
        notiStore.add('speak')
      }, 60000)
    }

    let id: NodeJS.Timeout
    sayLoveYou()

    return () => clearTimeout(id)
  }, [])

  const animatePetJump = contextSafe(
    () => {
      if (petRef.current) {
        gsap.fromTo(
          petRef.current,
          { y: -100, duration: 2, ease: 'expo.in' },
          { y: 0, duration: 1, ease: 'expo.out' },
        )
      }
    },
  )

  useEffect(() => {
    return onAction(petStore.store, ( { actionName } ) => {
      if (['eat', 'drink', 'play'].includes(actionName)) {
        animatePetJump()
      }
    })
  }, [animatePetJump])

  const handlePetClick = () => {
    animatePetJump()
    if (grindStore.canPetTap()) {
      if (petStore.petTap()) {
        grindStore.recordPetTap()
        achievementsStore.unlock('first_pet_tap')
      }
    }
  }

  return (
    <>
      <Noti target={petRef}/>
      <div className={styles['pet--container']} onClick={handlePetClick}>
        <h1 style={{ alignSelf: 'center' }}>{name}</h1>
        {pet && <MoodBubble pet={pet}/>}
        <div ref={petRef} style={{ margin: '0', padding: '0' }}>
          <AnimatedBreathing
            image={image}
            alt={alt}
            width={350}
            height={250}
          />
        </div>
      </div>
    </>
  )
}

export default memo(Pet)
