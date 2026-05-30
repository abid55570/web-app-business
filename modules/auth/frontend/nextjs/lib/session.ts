/**
 * Server-only session cookie helpers. Per PLAN §33.2 the JWT lives in an
 * httpOnly cookie and never reaches the browser.
 *
 * Wirer placement: <output>/frontend/src/lib/auth/session.ts
 */
import 'server-only'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from './constants'

export async function setSessionCookie(token: string, expiresAt: string) {
  const expires = new Date(expiresAt)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
    maxAge: Math.floor((expires.getTime() - Date.now()) / 1000),
  })
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
