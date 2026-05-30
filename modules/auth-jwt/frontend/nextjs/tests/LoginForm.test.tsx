/**
 * auth-jwt LoginForm component test (jsdom).
 *
 * Verifies: render, controlled inputs, submit POSTs to /api/auth/login,
 * onSuccess fires with the session token, ApiClientError surfaces inline.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth-jwt/LoginForm'

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('LoginForm (auth-jwt)', () => {
  it('renders email + password inputs and a submit button', () => {
    render(<LoginForm />)
    expect(
      screen.getByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('submits credentials and calls onSuccess with the session token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson({
        user: { id: 'u-1', email: 'a@a.com', role: 'customer' },
        session: { token: 'jwt-1', userId: 'u-1', expiresAt: '2026' },
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

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('jwt-1'))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'a@a.com',
      password: 'password123',
    })
  })

  it('renders the API error message when login returns a 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson(
        { code: 'AUTH_INVALID', message: 'Invalid email or password.' },
        401,
      ),
    )
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@a.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'nope' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/invalid email or password/i)
  })
})
