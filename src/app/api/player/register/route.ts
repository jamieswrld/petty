import { NextResponse } from 'next/server'

import { getClientIp } from '@component/app/lib/client-ip'
import { playerRegistry } from '@component/app/lib/player-registry'

export const dynamic = 'force-dynamic'

type RegisterBody = {
  username?: string
  walletAddress?: string | null
  authType?: 'guest' | 'wallet'
}

export async function POST( request: Request ) {
  try {
    const body = await request.json() as RegisterBody
    const username = body.username?.trim()
    if (!username || username.length < 2) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const ip = getClientIp(request)
    const walletAddress = body.walletAddress?.trim() || null
    const authType = body.authType === 'wallet' ? 'wallet' : 'guest'

    const result = playerRegistry.register(ip, {
      username,
      walletAddress,
      authType,
      createdAt: Date.now(),
    })

    if (!result.allowed) {
      return NextResponse.json(result, { status: 409 })
    }

    return NextResponse.json({ ok: true, username })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
