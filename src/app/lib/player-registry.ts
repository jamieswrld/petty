export type RegisteredProfile = {
  username: string
  walletAddress: string | null
  authType: 'guest' | 'wallet'
  createdAt: number
}

export type EligibilityResult = {
  allowed: boolean
  existingUsername?: string
  reason?: string
}

type Registry = {
  byIp: Map<string, RegisteredProfile>
  byWallet: Map<string, string>
}

const getRegistry = (): Registry => {
  const g = globalThis as typeof globalThis & { __petgotchiPlayerRegistry?: Registry }
  if (!g.__petgotchiPlayerRegistry) {
    g.__petgotchiPlayerRegistry = { byIp: new Map(), byWallet: new Map() }
  }
  return g.__petgotchiPlayerRegistry
}

export const playerRegistry = {
  check( ip: string, username?: string, walletAddress?: string | null ): EligibilityResult {
    const { byIp, byWallet } = getRegistry()
    const existing = byIp.get(ip)

    if (existing) {
      if (username && existing.username === username) {
        return { allowed: true }
      }
      return {
        allowed: false,
        existingUsername: existing.username,
        reason: 'Only one petgotchi profile is allowed per connection.',
      }
    }

    if (walletAddress) {
      const walletIp = byWallet.get(walletAddress)
      if (walletIp && walletIp !== ip) {
        return {
          allowed: false,
          reason: 'This wallet is already linked to another profile.',
        }
      }
    }

    return { allowed: true }
  },

  register(
    ip: string,
    profile: RegisteredProfile,
  ): EligibilityResult {
    const check = this.check(ip, profile.username, profile.walletAddress)
    if (!check.allowed) return check

    const { byIp, byWallet } = getRegistry()
    if (byIp.has(ip)) {
      const existing = byIp.get(ip)!
      if (existing.username !== profile.username) {
        return {
          allowed: false,
          existingUsername: existing.username,
          reason: 'Only one petgotchi profile is allowed per connection.',
        }
      }
      return { allowed: true }
    }

    byIp.set(ip, profile)
    if (profile.walletAddress) {
      byWallet.set(profile.walletAddress, ip)
    }
    return { allowed: true }
  },
}
