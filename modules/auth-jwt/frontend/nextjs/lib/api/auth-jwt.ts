import { apiFetch } from './client'

export type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  emailVerified: boolean
  mfaEnabled: boolean
  createdAt: string
}

export type Session = {
  token: string
  userId: string
  expiresAt: string
}

export type AuthResponse = {
  user: User
  session: Session
}

export type SignupBody = {
  email: string
  password: string
  name?: string
}

export type LoginBody = {
  email: string
  password: string
}

const PREFIX = '/api/auth'

export const authJwtApi = {
  signup: (body: SignupBody) =>
    apiFetch<AuthResponse>(`${PREFIX}/signup`, { method: 'POST', body }),
  login: (body: LoginBody) =>
    apiFetch<AuthResponse>(`${PREFIX}/login`, { method: 'POST', body }),
  me: () => apiFetch<User>(`${PREFIX}/me`),
  logout: () => apiFetch<void>(`${PREFIX}/logout`, { method: 'POST' }),
}
