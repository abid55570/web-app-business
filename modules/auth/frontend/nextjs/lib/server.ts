/**
 * Server-only fetcher: read the session cookie, ask the backend who the user is.
 * Returns null if not authenticated (caller redirects to /login).
 *
 * Wirer placement: <output>/frontend/src/lib/auth/server.ts
 */
import 'server-only'
import type { User } from '@/lib/types'
import { getSessionToken } from './session'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

export async function fetchCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }
  return (await response.json()) as User
}
