import React from 'react'
import Image from 'next/image'

import { xProfileUrl } from '@component/app/shared-data/shared-data'

export default function XBtn() {
  return (
    <a href={xProfileUrl} target='_blank' rel='noopener noreferrer' aria-label='Petgotchi on X'>
      <Image className='header--btn' src='/buttons/x-btn.svg' alt='' width={30} height={30}/>
    </a>
  )
}
