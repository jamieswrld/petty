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
  getGotchiMint,
  getTokenDecimals,
  loadTreasuryKeypair,
} from '@component/app/lib/treasury'

export async function sendTokenPayout(
  recipient: string,
  amount: number,
): Promise<string> {
  const mint = getGotchiMint()
  if (!mint) throw new Error('Token mint is not configured')

  const recipientPk = new PublicKey(recipient)
  const treasury = loadTreasuryKeypair()
  const connection = getConnection()
  const decimals = getTokenDecimals()
  const rawAmount = BigInt(Math.round(amount * 10 ** decimals))

  if (rawAmount <= BigInt(0)) throw new Error('Invalid payout amount')

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

  return sendAndConfirmTransaction(connection, tx, [treasury])
}
