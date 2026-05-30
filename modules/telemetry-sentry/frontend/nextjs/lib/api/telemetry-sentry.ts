import { apiFetch } from './client'

export type SentryHealth = { initialized: boolean }

export type SentryCaptureInput = {
  message: string
  level?: 'error' | 'warning' | 'info'
  fingerprint?: string
}

export type SentryCaptureResponse = {
  eventId: string | null
  captured: boolean
}

const BASE = '/api/telemetry/sentry'

export const sentryApi = {
  /** Returns whether SENTRY_DSN is wired and the SDK was initialized. */
  health: () => apiFetch<SentryHealth>(`${BASE}/health`),

  /** Admin-only synthetic event — useful for integration smoke tests. */
  capture: (body: SentryCaptureInput) =>
    apiFetch<SentryCaptureResponse>(`${BASE}/capture`, {
      method: 'POST',
      body,
    }),
}


/**
 * Frontend init helper — call once in `_app.tsx` or `instrumentation.ts`.
 * Real impl wraps `@sentry/nextjs`'s `init`; this stub keeps the surface
 * identical so tests don't need the package.
 */
export function initBrowserSentry(opts: {
  dsn: string
  environment?: string
  release?: string
  sampleRate?: number
}): void {
  if (typeof window === 'undefined') return
  if (!opts.dsn) return
  // In production:
  //   import * as Sentry from '@sentry/nextjs'
  //   Sentry.init({
  //     dsn: opts.dsn,
  //     environment: opts.environment,
  //     release: opts.release,
  //     tracesSampleRate: opts.sampleRate ?? 0.1,
  //   })
  // Stub:
  ;(window as unknown as { __sentryInit?: typeof opts }).__sentryInit = opts
}
