import React from 'react'
import type { Metadata } from 'next'
import { Pixelify_Sans } from 'next/font/google'

import { metaTitle, logoPath, siteName, siteUrl } from '@component/app/shared-data/shared-data'

import './styles/globals.css'
import Header from '@component/app/components/header'
import SoundEffects from '@component/app/components/sound-effects'
import LiveSocial from '@component/app/components/live-social/live-social'
import TreasuryStatus from '@component/app/components/treasury-status/treasury-status'
import SolanaProvider from '@component/app/components/solana/wallet-provider'

const pixelify = Pixelify_Sans({ weight: ['400', '600'], subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: metaTitle,
  description: `${siteName} — pixel Tamagotchi for grinders. Adopt a pet, earn coins, claim milestone rewards.`,
  openGraph: {
    title: metaTitle,
    description: `${siteName} — pixel Tamagotchi for grinders.`,
    url: siteUrl,
    siteName,
  },
}

export default function RootLayout( {
  children,
}: {
  children: React.ReactNode
} ) {
  return (
    <html lang='en'>
    <head>
      <title>{metaTitle}</title>
      <link rel='icon' type='image/png' href={logoPath}/>
    </head>
    <body className={pixelify.className}>
    <SolanaProvider>
      <SoundEffects/>
      <div className='body--container'>
        <Header/>
        <main>{children}</main>
        <LiveSocial/>
        <TreasuryStatus/>
      </div>
    </SolanaProvider>
    </body>
    </html>
  )
}

