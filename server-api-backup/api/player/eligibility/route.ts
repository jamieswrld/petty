import { NextResponse } from 'next/server'

import { getClientIp } from '@component/app/lib/client-ip'
import { playerRegistry } from '@component/app/lib/player-registry'

export const dynamic = 'force-dynamic'

export async function GET( request: Request ) {
  const ip = getClientIp(request)
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username') ?? undefined
  const wallet = searchParams.get('wallet') ?? undefined

  const result = playerRegistry.check(ip, username, wallet)
  return NextResponse.json({ ip, ...result })
}
