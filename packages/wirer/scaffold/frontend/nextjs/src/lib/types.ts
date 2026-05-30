// Base types shared across modules. Each module appends its own types here
// via the wirer's locale + types merge step.

export type User = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
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

export type ApiError = {
  code: string
  message: string
}
