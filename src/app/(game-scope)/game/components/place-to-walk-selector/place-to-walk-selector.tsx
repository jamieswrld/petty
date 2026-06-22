import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import Carousel from '@component/app/components/carousel/carousel'
import { walkBackgroundList } from '@component/app/shared-data/walkBackgrounds'
import { playSound } from '@component/app/utils/sounds'

import styles from './place-to-walk-selector.module.scss'

export default function PlaceToWalkSelector() {
  const router = useRouter()
  const [place, setPlace] = useState(walkBackgroundList[0])

  return (
    <div className={styles.container}>
      <h4 style={{ marginBottom: '10px' }}>Wanna earn some coins?</h4>
      <Carousel
        value={place}
        onChange={( value ) => {
          setPlace(value)
        }}
        slides={walkBackgroundList}
        visibleItemsNumber={1}
      >
        {( slide ) => (
          <div
            key={slide.id}
            className={styles['place--preview']}
            style={{ background: slide.background }}
          >
            <span>{slide.name}</span>
          </div>
        )}
      </Carousel>
      <button className={styles['walk--btn']} onClick={() => {
        playSound('walk')
        router.push(`/walk?place=${place.id}`)
      }}>
        <Image className={styles['walk--image']} src={'/buttons/walk-btn.svg'} alt='Walk' width={88} height={36}/>
      </button>
    </div>
  )
}
