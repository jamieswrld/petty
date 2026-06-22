'use client'

import { useEffect } from 'react'
import { onAction } from 'nanostores'

import { petStore } from '@component/app/pet-store'
import { playSound } from '@component/app/utils/sounds'
import { syncSoundFromStorage } from '@component/app/sound-store'

export default function SoundEffects() {
  useEffect(() => {
    syncSoundFromStorage()

    return onAction(petStore.store, ( { actionName } ) => {
      if (['eat', 'drink', 'play'].includes(actionName)) playSound('care')
      if (actionName === 'petTap') playSound('coin')
    })
  }, [])

  return null
}
