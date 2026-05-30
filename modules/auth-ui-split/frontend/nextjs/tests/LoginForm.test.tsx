/**
 * auth-ui-split LoginForm component test (jsdom).
 *
 * Same behavioural surface as auth-jwt's LoginForm — verifies the variant
 * stays in lockstep with the API contract while owning its own visual layer.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth-ui-split/LoginForm'

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('LoginForm (auth-ui-split)', () => {
  it('renders the brand tagline override', () => {
    render(<LoginForm tagline="Custom welcome." />)
    expect(screen.getByText('Custom welcome.')).toBeInTheDocument()
  })

  it('falls back to the default tagline when none provided', () => {
    render(<LoginForm />)
    expect(screen.getByText('Welcome back.')).toBeInTheDocument()
  })

  it('submits credentials to /api/auth/login (same API as auth-jwt)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson({
        user: { id: 'u-1', email: 'a@a.com', role: 'customer' },
        session: { token: 'jwt-split', userId: 'u-1', expiresAt: '2026' },
      }),
    )
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@a.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('jwt-split'))
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/login')
  })
})
