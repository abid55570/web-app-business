import { apiFetch } from './client'

export type PosthogHealth = { enabled: boolean; host: string }

export type PosthogTrackInput = {
  event: string
  distinctId?: string
  properties?: Record<string, unknown> | null
}

export type PosthogTrackResponse = {
  event: string
  outcome: 'delivered' | 'dropped' | 'disabled'
}

const BASE = '/api/telemetry/posthog'

export const posthogApi = {
  /** Wired? */
  health: () => apiFetch<PosthogHealth>(`${BASE}/health`),

  /** Server-side capture. Use this when the client may be offline or for
   * billing-relevant events you want to source-of-truth on the server. */
  track: (body: PosthogTrackInput) =>
    apiFetch<PosthogTrackResponse>(`${BASE}/track`, {
      method: 'POST',
      body,
    }),
}


/** Frontend init helper — call once in `_app.tsx`. Stub mirrors the
 * `posthog-js`'s `init` surface so swapping later is a one-line change. */
export function initBrowserPosthog(opts: {
  apiKey: string
  host?: string
  capturePageviews?: boolean
  captureClicks?: boolean
}): void {
  if (typeof window === 'undefined') return
  if (!opts.apiKey) return
  // In production:
  //   import posthog from 'posthog-js'
  //   posthog.init(opts.apiKey, {
  //     api_host: opts.host ?? 'https://us.posthog.com',
  //     capture_pageview: opts.capturePageviews ?? true,
  //     autocapture: opts.captureClicks ?? false,
  //   })
  ;(window as unknown as { __posthogInit?: typeof opts }).__posthogInit = opts
}
