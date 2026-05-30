/**
 * Frontend test setup.
 *
 * - Global `fetch` stub by default — individual tests override per-call via
 *   `vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(...)`. Prevents
 *   accidental real network calls from any module's API client.
 * - Imports `@testing-library/jest-dom/vitest` so `.toBeInTheDocument()` etc.
 *   are available to component tests running in jsdom.
 * - Per-test `cleanup()` from RTL so React trees from previous tests don't
 *   leak into the next render.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error(
        'Unmocked fetch() call in test. Use vi.spyOn(globalThis, "fetch") to stub per-test.',
      )
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
