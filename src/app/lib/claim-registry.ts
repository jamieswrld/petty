export type ClaimRecord = {
  walletAddress: string
  threshold: number
  username: string
  amount: number
  signature: string
  claimedAt: number
}

type Registry = Map<string, ClaimRecord>

const claimKey = ( wallet: string, threshold: number ) => `${wallet}:${threshold}`

const getRegistry = (): Registry => {
  const g = globalThis as typeof globalThis & { __petanaClaimRegistry?: Registry }
  if (!g.__petanaClaimRegistry) g.__petanaClaimRegistry = new Map()
  return g.__petanaClaimRegistry
}

export const claimRegistry = {
  has( wallet: string, threshold: number ): boolean {
    return getRegistry().has(claimKey(wallet, threshold))
  },
  get( wallet: string, threshold: number ): ClaimRecord | undefined {
    return getRegistry().get(claimKey(wallet, threshold))
  },
  register( record: ClaimRecord ): void {
    getRegistry().set(claimKey(record.walletAddress, record.threshold), record)
  },
}
