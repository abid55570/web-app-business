'use client'

/**
 * Default auth-jwt LoginForm — centered single-card layout.
 *
 * Variant modules (e.g. auth-ui-split) export the same component name from
 * a different namespace. Pages import whichever you wired in by editing
 * the import path; the recipe picks the variant by including its module.
 */
import { useState, type FormEvent } from 'react'
import { authJwtApi } from '@/lib/api/auth-jwt'
import { ApiClientError } from '@/lib/api/client'

export type LoginFormProps = {
  onSuccess?: (token: string) => void
  className?: string
}

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
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
    <div
      className={`mx-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm ${className}`}
    >
      <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Welcome back. Enter your credentials below.
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
  )
}
