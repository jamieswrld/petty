'use client'

import React, { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { logoPath } from '@component/app/shared-data/shared-data'
import VolumeBtn from '@component/app/components/volume-btn'
import InfoBtn from '@component/app/components/info-btn'
import XBtn from '@component/app/components/x-btn'
import Balance from '@component/app/components/balance'
import Profile from '@component/app/components/profile'

function Header() {
  const [colored, setColored] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop
      setColored(scrollPosition > 60)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }

  }, [])

  return (
    <header className={colored ? 'header--colored' : ''}>
      <div className='logo--container'>
        <Image className='petana-logo' src={logoPath} alt='Petana logo' width={30} height={30}/>
        <Link href='/'>Petana</Link>
        <VolumeBtn/>
        <InfoBtn/>
        <XBtn/>
      </div>
      <nav className='header--nav'>
        <ul>
          <li>
            <Link href='/game'>Home</Link>
          </li>
          <li>
            <Link href='/earn'>Earn</Link>
          </li>
          <li>
            <Link href='/about'>About</Link>
          </li>
          <Balance/>
          <Profile/>
        </ul>
      </nav>
    </header>
  )
}

export default memo(Header)
