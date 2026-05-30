/**
 * auth-jwt SignupForm component test (jsdom).
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SignupForm } from '@/components/auth-jwt/SignupForm'

function mockJson(body: unknown, status = 201): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('SignupForm (auth-jwt)', () => {
  it('renders three inputs (name optional, email + password required)', () => {
    render(<SignupForm />)
    expect(
      screen.getByRole('heading', { name: /create your account/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).not.toBeRequired()
    expect(screen.getByLabelText(/email/i)).toBeRequired()
    expect(screen.getByLabelText(/password/i)).toBeRequired()
  })

  it('omits the optional name when left blank', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson({
        user: { id: 'u-1', email: 'a@a.com', role: 'customer' },
        session: { token: 'jwt-1', userId: 'u-1', expiresAt: '2026' },
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

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('jwt-1'))
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init?.body as string)
    expect(body.email).toBe('a@a.com')
    expect(body.password).toBe('password123')
    expect('name' in body).toBe(false)
  })

  it('renders 409 EMAIL_TAKEN error inline', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockJson(
        {
          code: 'AUTH_EMAIL_TAKEN',
          message: 'An account with this email already exists.',
        },
        409,
      ),
    )
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'taken@a.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /already exists/i,
    )
  })
})
