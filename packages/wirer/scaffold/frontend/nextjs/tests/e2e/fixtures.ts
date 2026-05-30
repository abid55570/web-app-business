/**
 * Shared E2E fixtures.
 *
 * Provides `request` helpers tied to BACKEND_URL so specs can seed data
 * (admin signup, menu items) without going through the UI for setup-only steps.
 */
import { test as base, expect, type APIRequestContext } from '@playwright/test'


export const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000'


export type ApiHelpers = {
  signup: (email: string, password: string, name?: string) => Promise<{
    token: string
    userId: string
  }>
  promoteToAdmin: (email: string) => Promise<void>
  authedFetch: (
    path: string,
    init?: { method?: string; body?: unknown; token?: string },
  ) => Promise<Response>
}


export const test = base.extend<{
  api: APIRequestContext
  helpers: ApiHelpers
}>({
  api: async ({ playwright }, run) => {
    const ctx = await playwright.request.newContext({ baseURL: BACKEND })
    await run(ctx)
    await ctx.dispose()
  },
  helpers: async ({ api }, run) => {
    const helpers: ApiHelpers = {
      async signup(email, password, name) {
        const res = await api.post('/api/auth/signup', {
          data: { email, password, name },
        })
        expect(res.ok()).toBeTruthy()
        const body = await res.json()
        return { token: body.session.token, userId: body.user.id }
      },
      async promoteToAdmin(email) {
        // Test-only escalation. Real apps would never expose this — the
        // generator might ship a `manage.py promote_admin` or equivalent;
        // for E2E we expect the operator to either seed an admin manually
        // or wire a setup script. Left as-is for now.
        void email
      },
      async authedFetch(path, init = {}) {
        const url = `${BACKEND}${path}`
        const headers: Record<string, string> = {
          'content-type': 'application/json',
        }
        if (init.token) headers.authorization = `Bearer ${init.token}`
        return fetch(url, {
          method: init.method ?? 'GET',
          headers,
          body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        })
      },
    }
    await run(helpers)
  },
})


export { expect }
