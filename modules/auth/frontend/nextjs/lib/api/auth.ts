/**
 * Typed client for the auth API. Goes through Next.js API proxy routes which
 * inject the httpOnly cookie's bearer token (see lib/auth/session.ts).
 *
 * Wirer placement: <output>/frontend/src/lib/api/auth.ts
 */
import type { AuthResponse, User } from '@/lib/types'
import { apiFetch } from './client'

const API = '/api/auth'

export const authApi = {
  signup: (body: { email: string; password: string; name?: string }) =>
    apiFetch<AuthResponse>(`${API}/signup`, { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>(`${API}/login`, { method: 'POST', body }),

  me: () => apiFetch<User>(`${API}/me`),

  logout: () => apiFetch<void>(`${API}/logout`, { method: 'POST' }),
}
