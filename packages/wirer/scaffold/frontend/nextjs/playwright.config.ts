import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the generated frontend.
 *
 * Specs live under `tests/e2e/`. Each spec assumes the backend is reachable
 * via `BACKEND_URL` (default http://localhost:8000) and the Next.js dev
 * server at `BASE_URL` (default http://localhost:3000) — Playwright's
 * `webServer` block boots the Next dev server automatically; the backend
 * needs to be started separately:
 *
 *   # in <out>/backend/
 *   uvicorn app.main:app --reload --port 8000          # FastAPI
 *   # OR
 *   python manage.py migrate && python manage.py runserver 8000   # Django
 *
 * Then in <out>/frontend/:
 *   pnpm playwright:install   # one-time browser install
 *   pnpm test:e2e
 *
 * Visual regression baselines live in `tests/e2e/__screenshots__/`
 * — run `pnpm test:e2e -- --update-snapshots` after intentional UI tweaks.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: {
      // Smoke specs talk to the backend directly when needed; this header
      // lets per-test route handlers route around CORS in dev.
      'x-e2e': '1',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: process.env.BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
