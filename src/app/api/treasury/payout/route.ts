import { NextResponse } from 'next/server'

import { sendTokenPayout } from '@component/app/lib/treasury-payout'
import { getGotchiMint, isTreasuryConfigured } from '@component/app/lib/treasury'

export const dynamic = 'force-dynamic'

type PayoutBody = {
  recipient: string
  amount: number
  adminSecret?: string
}

export async function POST( request: Request ) {
  const adminSecret = process.env.TREASURY_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    return NextResponse.json({ error: 'Treasury payouts are not enabled' }, { status: 503 })
  }

  if (!isTreasuryConfigured()) {
    return NextResponse.json({ error: 'Treasury wallet is not configured' }, { status: 503 })
  }

  if (!getGotchiMint()) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_GOTCHI_MINT is not set' }, { status: 503 })
  }

  try {
    const body = await request.json() as PayoutBody
    if (body.adminSecret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recipient = body.recipient?.trim()
    const amount = body.amount
    if (!recipient || !amount || amount <= 0) {
      return NextResponse.json({ error: 'recipient and amount are required' }, { status: 400 })
    }

    const signature = await sendTokenPayout(recipient, amount)

    return NextResponse.json({
      ok: true,
      signature,
      recipient,
      amount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payout failed' },
      { status: 500 },
    )
  }
}
