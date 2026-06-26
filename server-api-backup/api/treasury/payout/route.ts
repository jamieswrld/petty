import { NextResponse } from 'next/server'
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
} from '@solana/spl-token'
import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  getConnection,
  getPetgotchiMint,
  getTokenDecimals,
  isTreasuryConfigured,
  loadTreasuryKeypair,
} from '@component/app/lib/treasury'

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

  const mint = getPetgotchiMint()
  if (!mint) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_PETGOTCHI_MINT is not set' }, { status: 503 })
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

    const recipientPk = new PublicKey(recipient)
    const treasury = loadTreasuryKeypair()
    const connection = getConnection()
    const decimals = getTokenDecimals()
    const rawAmount = BigInt(Math.round(amount * 10 ** decimals))

    const treasuryAta = getAssociatedTokenAddressSync(mint, treasury.publicKey)
    const recipientAta = getAssociatedTokenAddressSync(mint, recipientPk)

    const tx = new Transaction()

    try {
      await getAccount(connection, recipientAta)
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          treasury.publicKey,
          recipientAta,
          recipientPk,
          mint,
        ),
      )
    }

    tx.add(
      createTransferInstruction(
        treasuryAta,
        recipientAta,
        treasury.publicKey,
        rawAmount,
      ),
    )

    const signature = await sendAndConfirmTransaction(connection, tx, [treasury])

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
