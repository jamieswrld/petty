import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function InfoBtn() {
  return (
    <Link href='/earn' aria-label='How to earn'>
      <Image className='header--btn' src={'/buttons/info-btn.svg'} alt='How to earn' width={30} height={30}/>
    </Link>
  )
}
