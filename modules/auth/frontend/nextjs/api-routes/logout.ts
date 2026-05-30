/**
 * /api/auth/logout proxy. Best-effort backend logout (token is stateless so
 * even if the backend call fails, clearing the cookie is sufficient).
 *
 * Wirer placement: <output>/frontend/src/app/api/auth/logout/route.ts
 */
import { NextResponse } from 'next/server'
import { clearSessionCookie, getSessionToken } from '@/lib/auth/session'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

export async function POST() {
  const token = await getSessionToken()

  if (token) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      // Best-effort: even if backend logout fails, we still clear our cookie.
    })
  }

  await clearSessionCookie()
  return new NextResponse(null, { status: 204 })
}
