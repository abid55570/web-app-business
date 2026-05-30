'use client'

/**
 * auth-ui-split — LoginForm with brand panel left, form right.
 *
 * Reuses the auth-jwt API client (``authJwtApi``); only the visual treatment
 * differs from auth-jwt's default ``LoginForm``.
 */
import { useState, type FormEvent } from 'react'
import { authJwtApi } from '@/lib/api/auth-jwt'
import { ApiClientError } from '@/lib/api/client'

export type LoginFormProps = {
  onSuccess?: (token: string) => void
  brandImageUrl?: string
  tagline?: string
}

export function LoginForm({
  onSuccess,
  brandImageUrl = '/images/auth-brand.svg',
  tagline = 'Welcome back.',
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await authJwtApi.login({ email, password })
      onSuccess?.(res.session.token)
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside
        className="relative hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: `url(${brandImageUrl})` }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 to-accent/70" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-primary-foreground">
          <p className="text-3xl font-semibold leading-tight">{tagline}</p>
        </div>
      </aside>
      <main className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your credentials below.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
