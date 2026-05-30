/**
 * /api/auth/me proxy. Reads cookie via fetchCurrentUser, returns the user or
 * 401. Useful for client-side "am I logged in?" checks.
 *
 * Wirer placement: <output>/frontend/src/app/api/auth/me/route.ts
 */
import { NextResponse } from 'next/server'
import { fetchCurrentUser } from '@/lib/auth/server'

export async function GET() {
  const user = await fetchCurrentUser()
  if (!user) {
    return NextResponse.json(
      { code: 'AUTH_MISSING_TOKEN', message: 'Not authenticated' },
      { status: 401 },
    )
  }
  return NextResponse.json(user)
}
