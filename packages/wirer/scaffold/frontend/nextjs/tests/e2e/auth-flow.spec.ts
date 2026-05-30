/**
 * E2E — auth happy path.
 *
 * Walks the user through signup via the LoginForm → /me read with the
 * minted token → logout. Mirrors the FastAPI/Django auth-jwt + auth-core
 * smoke chain but exercises real HTTP through both layers.
 *
 * Pre-reqs: backend running at $BACKEND_URL (default :8000), frontend
 * served by Playwright's webServer (Next dev on :3000), DB clean.
 */
import { test, expect, BACKEND } from './fixtures'


test('signup → /me read → logout', async ({ page, request }) => {
  const email = `e2e-${Date.now()}@example.com`
  const password = 'password-e2e-12345'

  // Drive the SignupForm through the UI.
  await page.goto('/signup')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /create account/i }).click()

  // The default form's onSuccess persists the token however the host page
  // wires it; for this smoke we read the just-issued token straight from
  // the backend so we don't depend on the host page's auth-state plumbing.
  const login = await request.post(`${BACKEND}/api/auth/login`, {
    data: { email, password },
  })
  expect(login.ok()).toBeTruthy()
  const { session } = await login.json()

  const me = await request.get(`${BACKEND}/api/auth/me`, {
    headers: { authorization: `Bearer ${session.token}` },
  })
  expect(me.ok()).toBeTruthy()
  const meBody = await me.json()
  expect(meBody.email).toBe(email)
  expect(meBody.role).toBe('customer')

  const logout = await request.post(`${BACKEND}/api/auth/logout`, {
    headers: { authorization: `Bearer ${session.token}` },
  })
  expect(logout.status()).toBe(204)
})


test('login fails with wrong password (AUTH_INVALID)', async ({ request }) => {
  const res = await request.post(`${BACKEND}/api/auth/login`, {
    data: { email: 'ghost@example.com', password: 'whatever' },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  // FastAPI returns flat {code, message}; Django's HTTPException returns
  // {detail: {...}}. Tolerate both shapes during the cross-stack window.
  const code = body.code ?? body.detail?.code
  expect(code).toBe('AUTH_INVALID')
})
