import { NextResponse } from 'next/server'
import { liveHub } from '@component/app/lib/live-hub'

export const dynamic = 'force-dynamic'

export async function GET( request: Request ) {
  const since = Number(new URL(request.url).searchParams.get('since') ?? 0)
  return NextResponse.json({ messages: liveHub.getMessages(since) })
}

export async function POST( request: Request ) {
  try {
    const body = await request.json() as { username?: string; text?: string }
    const message = liveHub.addMessage(body.username ?? 'Guest', body.text ?? '')
    if (!message) return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
