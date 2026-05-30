/**
 * /api/auth/login proxy — POSTs to the backend, sets the httpOnly session
 * cookie on success, returns the user (no token in the response body).
 *
 * Wirer placement: <output>/frontend/src/app/api/auth/login/route.ts
 */
import { NextResponse, type NextRequest } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const upstream = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  await setSessionCookie(data.session.token, data.session.expiresAt)
  return NextResponse.json({ user: data.user }, { status: 200 })
}
