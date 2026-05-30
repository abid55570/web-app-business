import { apiFetch } from './client'

export type PlausibleHealth = {
  enabled: boolean
  host: string
  domain: string | null
}

export type PlausibleGoalInput = {
  name: string
  url: string
  props?: Record<string, unknown> | null
}

export type PlausibleGoalResponse = {
  name: string
  outcome: 'delivered' | 'dropped' | 'disabled'
}

const BASE = '/api/telemetry/plausible'

export const plausibleApi = {
  health: () => apiFetch<PlausibleHealth>(`${BASE}/health`),

  /** Server-side goal — use for billing-relevant conversions where the
   * client may not survive the redirect. */
  goal: (body: PlausibleGoalInput) =>
    apiFetch<PlausibleGoalResponse>(`${BASE}/goal`, {
      method: 'POST',
      body,
    }),
}


/** Returns the HTML snippet to drop in your Next.js root layout's
 * `<head>`. Hosted by Plausible (or your self-hosted host). */
export function plausibleScriptTag(opts: {
  domain: string
  host?: string
}): string {
  const host = opts.host ?? 'https://plausible.io'
  return `<script defer data-domain="${escapeHtml(opts.domain)}" src="${host}/js/script.js"></script>`
}


function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
