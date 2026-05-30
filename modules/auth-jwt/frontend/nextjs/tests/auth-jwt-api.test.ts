/**
 * auth-jwt API client smoke — verifies the typed client builds the right
 * requests and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { authJwtApi, type AuthResponse } from '@/lib/api/auth-jwt'

const SAMPLE: AuthResponse = {
  user: {
    id: 'u-1',
    email: 'a@a.com',
    name: 'A',
    phone: null,
    role: 'customer',
    emailVerified: false,
    mfaEnabled: false,
    createdAt: '2026-05-10T00:00:00Z',
  },
  session: {
    token: 'jwt-here',
    userId: 'u-1',
    expiresAt: '2026-05-17T00:00:00Z',
  },
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('authJwtApi', () => {
  it('signup() POSTs JSON and returns parsed AuthResponse', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE, 201))

    const res = await authJwtApi.signup({
      email: 'a@a.com',
      password: 'password123',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/signup')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'a@a.com',
      password: 'password123',
    })
    expect(res.user.email).toBe('a@a.com')
    expect(res.session.token).toBe('jwt-here')
  })

  it('login() POSTs JSON and returns AuthResponse', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE))

    await authJwtApi.login({ email: 'a@a.com', password: 'pw' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(init?.method).toBe('POST')
  })

  it('me() GETs /api/auth/me', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE.user))

    const me = await authJwtApi.me()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/me')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(me.email).toBe('a@a.com')
  })

  it('logout() POSTs /api/auth/logout and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await authJwtApi.logout()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/logout')
    expect(init?.method).toBe('POST')
    expect(res).toBeUndefined()
  })
})
