/**
 * auth-ui-split SignupForm component test (jsdom).
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SignupForm } from '@/components/auth-ui-split/SignupForm'

function mockJson(body: unknown, status = 201): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('SignupForm (auth-ui-split)', () => {
  it('renders default tagline', () => {
    render(<SignupForm />)
    expect(screen.getByText('Start something good.')).toBeInTheDocument()
  })

  it('submits to /api/auth/signup (same API as auth-jwt)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson({
        user: { id: 'u-1', email: 'a@a.com', role: 'customer' },
        session: { token: 'jwt-split', userId: 'u-1', expiresAt: '2026' },
      }),
    )
    const onSuccess = vi.fn()
    render(<SignupForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@a.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('jwt-split'))
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/signup')
  })
})
