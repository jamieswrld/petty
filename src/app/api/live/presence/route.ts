import { NextResponse } from 'next/server'
import { liveHub } from '@component/app/lib/live-hub'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(liveHub.getPresence())
}

export async function POST( request: Request ) {
  try {
    const body = await request.json() as { id?: string; username?: string; leave?: boolean }
    const id = body.id?.trim()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (body.leave) {
      liveHub.leave(id)
    } else {
      liveHub.heartbeat(id, body.username ?? 'Guest')
    }

    return NextResponse.json(liveHub.getPresence())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE( request: Request ) {
  try {
    const body = await request.json() as { id?: string }
    if (body.id) liveHub.leave(body.id)
    return NextResponse.json(liveHub.getPresence())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
