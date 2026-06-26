'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { playerStore } from './player-store'
import usePlayer from './hooks/usePlayer'
import usePet from './hooks/usePet'
import useProfileEligibility from './hooks/useProfileEligibility'
import AnimatedHeartBeating from './components/animations/animated-heart-beating'
import { playSound } from './utils/sounds'

import { logoPath } from './shared-data/shared-data'
import ContractAddress from './components/contract-address'

import styles from './styles/login.module.scss'

export default function Login() {
  const router = useRouter()
  const { player, loaded } = usePlayer()
  const pet = usePet()
  const { publicKey, connecting, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  // Set once the user clicks "Connect wallet", so we only route forward when
  // THIS interaction connects a wallet (not a silent autoConnect on load).
  const [walletFlow, setWalletFlow] = useState(false)

  const eligibility = useProfileEligibility(
    player?.username || undefined,
    publicKey?.toBase58() ?? player?.walletAddress,
    loaded && !player?.username,
  )
  const profileBlocked = loaded && !player?.username && !eligibility.loading && !eligibility.allowed

  // Already onboarded -> game if they have a pet, otherwise finish setup.
  useEffect(() => {
    if (!loaded || !player?.username) return
    router.push(pet ? '/game' : '/create')
  }, [loaded, player, pet, router])

  // A wallet finished connecting as part of the connect flow.
  useEffect(() => {
    if (walletFlow && publicKey && !profileBlocked) {
      playerStore.signInWallet(publicKey.toBase58())
      router.push('/create')
    }
  }, [walletFlow, publicKey, router, profileBlocked])

  const playAsGuest = () => {
    if (profileBlocked) return
    playSound('click')
    playerStore.signInGuest()
    router.push('/create')
  }

  const connectWallet = () => {
    if (profileBlocked) return
    playSound('click')
    setWalletFlow(true)
    if (publicKey) {
      playerStore.signInWallet(publicKey.toBase58())
      router.push('/create')
    } else {
      setVisible(true)
    }
  }

  const disconnectWallet = async () => {
    setWalletFlow(false)
    try {
      if (connected) await disconnect()
    } catch (error) {
      //ignored
    }
  }

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
    : null

  return (
    <div className={styles['login--container']}>
      <div className={styles['login--hero']}>
        <AnimatedHeartBeating
          image={logoPath}
          alt='Petgotchi logo'
          style='hero-logo'
          width={168}
          height={168}
        />
        <h1 className={styles.title}>
          Welcome to <span className={styles.brand}>Petgotchi</span>
        </h1>
        <p className={styles.subtitle}>
          Raise a pixel pet, stack daily streaks, and earn coins while you care for your companion.
        </p>
      </div>

      {profileBlocked && (
        <div className={styles['profile-blocked']}>
          <p className={styles['profile-blocked--title']}>One profile per connection</p>
          <p className={styles['profile-blocked--text']}>
            {eligibility.reason ?? 'Only one Petgotchi profile is allowed from your network.'}
            {eligibility.existingUsername && (
              <> Your profile is <strong>{eligibility.existingUsername}</strong>.</>
            )}
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type='button'
          className={`${styles.btn} ${styles['btn--primary']}`}
          onClick={connectWallet}
          disabled={connecting || profileBlocked}
        >
          {connecting
            ? 'Connecting…'
            : connected
              ? `Continue with ${shortAddress}`
              : 'Connect Solana wallet'}
        </button>

        <button
          type='button'
          className={`${styles.btn} ${styles['btn--secondary']}`}
          onClick={playAsGuest}
          disabled={profileBlocked}
        >
          Play as guest
        </button>

        {connected && (
          <button
            type='button'
            className={styles['link--btn']}
            onClick={disconnectWallet}
          >
            Disconnect wallet
          </button>
        )}
      </div>

      <p className={styles.hint}>
        Connecting a wallet lets you claim rewards once you hit milestones in-game.
      </p>

      <ContractAddress className={styles.ca}/>
    </div>
  )
}
