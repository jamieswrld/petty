'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useStore } from '@nanostores/react'

import { playSound } from '@component/app/utils/sounds'
import { setMuted, soundStore, syncSoundFromStorage } from '@component/app/sound-store'

function VolumeBtn() {
  const { muted } = useStore(soundStore)

  useEffect(() => {
    syncSoundFromStorage()
  }, [])

  const toggle = () => {
    const next = !muted
    setMuted(next)
    if (!next) playSound('click')
  }

  return (
    <Image
      className='header--btn'
      src={muted ? '/buttons/volume-off.svg' : '/buttons/volume-on.svg'}
      alt={muted ? 'Sound off' : 'Sound on'}
      width={30}
      height={30}
      onClick={toggle}
    />
  )
}

export default VolumeBtn
