import { NextResponse } from 'next/server'
import { getTreasuryStatus } from '@component/app/lib/treasury'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = await getTreasuryStatus()
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Treasury status failed' },
      { status: 500 },
    )
  }
}
