import bs58Module from 'bs58'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js'
import { getAccount, getMint } from '@solana/spl-token'

const bs58Decode = ( input: string ): Uint8Array => {
  const mod = bs58Module as typeof bs58Module & { default?: { decode: ( s: string ) => Uint8Array } }
  const decode = mod.decode ?? mod.default?.decode
  if (!decode) throw new Error('bs58 decode unavailable')
  return decode(input)
}

export const getRpcUrl = () =>
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta')

export const getConnection = () => new Connection(getRpcUrl(), 'confirmed')

export const getPetgotchiMint = (): PublicKey | null => {
  const mint =
    process.env.NEXT_PUBLIC_PETGOTCHI_MINT?.trim() ||
    process.env.NEXT_PUBLIC_PETANA_MINT?.trim()
  if (!mint) return null
  try {
    return new PublicKey(mint)
  } catch {
    return null
  }
}

export const getTokenDecimals = () => {
  const n = Number(
    process.env.PETGOTCHI_TOKEN_DECIMALS ??
      process.env.PETANA_TOKEN_DECIMALS ??
      9,
  )
  return Number.isFinite(n) ? n : 9
}

export const loadTreasuryKeypair = (): Keypair => {
  const raw = process.env.TREASURY_PRIVATE_KEY?.trim()
  if (!raw) throw new Error('TREASURY_PRIVATE_KEY is not configured')

  try {
    if (raw.startsWith('[')) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw) as number[]))
    }
    return Keypair.fromSecretKey(bs58Decode(raw))
  } catch {
    throw new Error('TREASURY_PRIVATE_KEY format is invalid')
  }
}

export const getTreasuryPublicKey = (): PublicKey => {
  const override = process.env.NEXT_PUBLIC_TREASURY_WALLET?.trim()
  if (override) return new PublicKey(override)
  return loadTreasuryKeypair().publicKey
}

export const isTreasuryConfigured = () =>
  Boolean(process.env.TREASURY_PRIVATE_KEY?.trim())

export type TreasuryStatus = {
  configured: boolean
  address: string
  solBalance: number
  petgotchiMint: string | null
  petgotchiBalance: number | null
  rpc: string
}

export const getTreasuryStatus = async (): Promise<TreasuryStatus> => {
  const connection = getConnection()
  const mint = getPetgotchiMint()
  const configured = isTreasuryConfigured()

  let address: string
  if (configured) {
    address = getTreasuryPublicKey().toBase58()
  } else {
    address = process.env.NEXT_PUBLIC_TREASURY_WALLET?.trim() ?? ''
  }

  if (!address) {
    return {
      configured: false,
      address: '',
      solBalance: 0,
      petgotchiMint: mint?.toBase58() ?? null,
      petgotchiBalance: null,
      rpc: getRpcUrl(),
    }
  }

  const pubkey = new PublicKey(address)
  const lamports = await connection.getBalance(pubkey)

  let petgotchiBalance: number | null = null
  if (mint) {
    try {
      const accounts = await connection.getTokenAccountsByOwner(pubkey, { mint })
      if (accounts.value.length > 0) {
        const account = await getAccount(connection, accounts.value[0].pubkey)
        const mintInfo = await getMint(connection, mint)
        petgotchiBalance = Number(account.amount) / 10 ** mintInfo.decimals
      } else {
        petgotchiBalance = 0
      }
    } catch {
      petgotchiBalance = null
    }
  }

  return {
    configured,
    address,
    solBalance: lamports / LAMPORTS_PER_SOL,
    petgotchiMint: mint?.toBase58() ?? null,
    petgotchiBalance,
    rpc: getRpcUrl(),
  }
}
