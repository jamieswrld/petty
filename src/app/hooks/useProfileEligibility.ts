'use client'

import { useEffect, useState } from 'react'

export type ProfileEligibility = {
  allowed: boolean
  existingUsername?: string
  reason?: string
  loading: boolean
}

export default function useProfileEligibility(
  username?: string,
  walletAddress?: string | null,
  enabled = true,
): ProfileEligibility {
  const [state, setState] = useState<ProfileEligibility>({
    allowed: true,
    loading: enabled,
  })

  useEffect(() => {
    if (!enabled) {
      setState({ allowed: true, loading: false })
      return
    }

    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (walletAddress) params.set('wallet', walletAddress)

    fetch(`/api/player/eligibility?${params.toString()}`)
      .then(( r ) => r.json())
      .then(( data ) => {
        setState({
          allowed: Boolean(data.allowed),
          existingUsername: data.existingUsername,
          reason: data.reason,
          loading: false,
        })
      })
      .catch(() => {
        setState({ allowed: true, loading: false })
      })
  }, [username, walletAddress, enabled])

  return state
}
