import { NextResponse } from 'next/server'

import { claimRegistry } from '@component/app/lib/claim-registry'
import { sendTokenPayout } from '@component/app/lib/treasury-payout'
import { isTreasuryConfigured } from '@component/app/lib/treasury'
import { milestones } from '@component/app/shared-data/milestones'

export const dynamic = 'force-dynamic'

type ClaimBody = {
  walletAddress?: string
  threshold?: number
  username?: string
  totalEarned?: number
}

const isTestMode = () => process.env.CLAIM_TEST_MODE === 'true'

export async function POST( request: Request ) {
  if (!isTreasuryConfigured()) {
    return NextResponse.json(
      { error: 'Treasury is not configured on the server' },
      { status: 503 },
    )
  }

  try {
    const body = await request.json() as ClaimBody
    const walletAddress = body.walletAddress?.trim()
    const threshold = body.threshold
    const username = body.username?.trim() || 'Player'
    const totalEarned = body.totalEarned ?? 0

    if (!walletAddress || threshold == null) {
      return NextResponse.json({ error: 'walletAddress and threshold are required' }, { status: 400 })
    }

    const milestone = milestones.find(( m ) => m.threshold === threshold)
    if (!milestone?.tokenPayout) {
      return NextResponse.json({ error: 'Invalid milestone' }, { status: 400 })
    }

    if (totalEarned < threshold) {
      return NextResponse.json({ error: 'Milestone not unlocked yet' }, { status: 403 })
    }

    if (claimRegistry.has(walletAddress, threshold)) {
      const existing = claimRegistry.get(walletAddress, threshold)!
      return NextResponse.json({
        ok: true,
        alreadyClaimed: true,
        signature: existing.signature,
        amount: existing.amount,
        testMode: isTestMode(),
      })
    }

    const amount = isTestMode() ? 1 : milestone.tokenPayout
    const signature = await sendTokenPayout(walletAddress, amount)

    claimRegistry.register({
      walletAddress,
      threshold,
      username,
      amount,
      signature,
      claimedAt: Date.now(),
    })

    return NextResponse.json({
      ok: true,
      signature,
      amount,
      testMode: isTestMode(),
      explorer: `https://solscan.io/tx/${signature}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Claim failed' },
      { status: 500 },
    )
  }
}

export async function GET( request: Request ) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')?.trim()
  const threshold = Number(searchParams.get('threshold'))

  if (!wallet || !threshold) {
    return NextResponse.json({ configured: isTreasuryConfigured(), testMode: isTestMode() })
  }

  const record = claimRegistry.get(wallet, threshold)
  return NextResponse.json({
    claimed: Boolean(record),
    record: record ?? null,
    testMode: isTestMode(),
  })
}
