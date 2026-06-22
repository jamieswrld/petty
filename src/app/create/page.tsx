'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import Carousel from '@component/app/components/carousel/carousel'
import { Slide, slides } from '@component/app/shared-data/slides'
import { Pet } from '@component/app/types/pet'
import { petStore } from '@component/app/pet-store'
import { STARTING_BALANCE } from '@component/app/shared-data/economy'
import { logoPath } from '@component/app/shared-data/shared-data'
import { playerStore } from '@component/app/player-store'
import usePlayer from '@component/app/hooks/usePlayer'
import usePet from '@component/app/hooks/usePet'
import useProfileEligibility from '@component/app/hooks/useProfileEligibility'

import AnimatedHeartBeating from '@component/app/components/animations/animated-heart-beating'
import AnimatedSwap from '@component/app/components/animations/animated-swap'
import { playSound } from '@component/app/utils/sounds'

import styles from '@component/app/styles/home.module.scss'

const createPet = ( selectedSlide: Slide ) => {
  const pet: Pet = {
    image: selectedSlide.image,
    alt: selectedSlide.alt,
    name: selectedSlide.name,
    diet: selectedSlide.diet,
    fullness: 100,
    thirst: 100,
    happiness: 100,
    urine: 0,
    balance: STARTING_BALANCE,
    totalEarned: 0,
  }
  petStore.createPet(pet)
}

export default function CreateWorld() {
  const router = useRouter()
  const { player, loaded } = usePlayer()
  const pet = usePet()

  const [selectedSlide, setSelectedSlide] = useState(slides[0])
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const eligibility = useProfileEligibility(
    player?.username || undefined,
    player?.walletAddress,
    loaded && !!player,
  )

  useEffect(() => {
    if (player?.username) setUsername(player.username)
  }, [player?.username])

  const poopImages = useMemo(() => ['/game-asset/poo_1.svg', '/game-asset/poo_2.svg'], [])

  // Must be signed in. Players with a username and pet go straight to the game.
  useEffect(() => {
    if (!loaded) return
    if (!player) {
      router.replace('/')
    } else if (player.username && pet) {
      router.replace('/game')
    }
  }, [loaded, player, pet, router])

  const handleUsername = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setUsername(e.target.value.replace(/[^a-zA-Z0-9_ ]/g, ''))
  }

  const canSubmit = username.trim().length >= 2 && !submitting
  const profileBlocked = loaded && !!player && !eligibility.loading && !eligibility.allowed

  if (profileBlocked) {
    return (
      <div className={styles['profile-blocked']}>
        <AnimatedHeartBeating
          image={logoPath}
          alt='Petana logo'
          style='hero-logo'
          width={140}
          height={140}
        />
        <h2>One profile per connection</h2>
        <p>
          {eligibility.reason ?? 'Only one Petana profile is allowed from your network.'}
          {eligibility.existingUsername && (
            <> Your profile is <strong>{eligibility.existingUsername}</strong>.</>
          )}
        </p>
        <button type='button' className={styles['profile-blocked--btn']} onClick={() => router.push('/')}>
          Back to login
        </button>
      </div>
    )
  }

  return (
    <form
      className={styles['pet--form']}
      onSubmit={async ( e ) => {
        e.preventDefault()
        if (!canSubmit || !player) return

        setSubmitting(true)
        setSubmitError(null)

        const trimmedUsername = username.trim()

        try {
          const res = await fetch('/api/player/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: trimmedUsername,
              walletAddress: player.walletAddress,
              authType: player.authType,
            }),
          })

          if (res.status === 409) {
            const data = await res.json()
            setSubmitError(data.reason || data.error || 'Could not create profile')
            setSubmitting(false)
            return
          }
        } catch {
          // Static GitHub Pages has no API — continue with client-only save.
        }

        playSound('claim')
        playerStore.setUsername(trimmedUsername)
        createPet(selectedSlide)
        router.push('/game')
      }}
    >
      <AnimatedHeartBeating
        image={logoPath}
        alt='Petana logo'
        style='hero-logo'
        width={140}
        height={140}
      />

      <div className={styles['naming--container']}>
        <h2>Name your Petana world</h2>
        <input
          type='text'
          placeholder='Choose a username'
          value={username}
          onChange={handleUsername}
          maxLength={20}
          autoFocus
        />
        {player?.walletAddress && (
          <span className={styles['wallet--note']}>
            Wallet: {player.walletAddress.slice(0, 4)}…{player.walletAddress.slice(-4)}
          </span>
        )}
      </div>

      <div className={styles['pet-options--container']}>
        <h3>Choose your pet!</h3>
        <Carousel
          value={selectedSlide}
          onChange={( value ) => {
            setSelectedSlide(value)
          }}
          slides={slides}
        >
          {( slide, isSelected ) => (
            <div
              key={slide.id}
              className={styles['slide--container']}
            >
              <Image
                className={`${styles['slide--image']} ${
                  isSelected ? styles.element__selected : ''
                }`}
                src={slide.image}
                alt={slide.alt}
                width={238}
                height={160}
                priority
              />
              <h3>{slide.name}</h3>
              <p className={styles['slide--species']}>{slide.alt}</p>
            </div>
          )}
        </Carousel>
        {submitError && <p className={styles['profile-blocked--error']}>{submitError}</p>}
        <button className={styles['play--btn']} type='submit' disabled={!canSubmit} aria-label='Play'>
          <Image className={styles['play--image']} src={'/buttons/play-btn.svg'} alt='Play' width={160} height={66}/>
        </button>
      </div>
      <AnimatedSwap images={poopImages} alt='Poo' style='poo'/>
    </form>
  )
}
