import { apiFetch } from './client'

export type FeatureFlag = {
  id: string
  key: string
  description: string | null
  enabled: boolean
  rolloutPercent: number
  audiences: string[]
  createdAt: string
  updatedAt: string
}

export type PublicFlag = {
  key: string
  enabled: boolean
}

export type FlagCreateInput = {
  key: string
  description?: string | null
  enabled?: boolean
  rolloutPercent?: number
  audiences?: string[]
}

export type FlagUpdateInput = Omit<Partial<FlagCreateInput>, 'key'>

export type FlagListResponse = {
  items: FeatureFlag[]
  total: number
}

export type PublicListResponse = {
  items: PublicFlag[]
  total: number
}

export type CheckResponse = {
  key: string
  enabled: boolean
  audience: string | null
}

const PUBLIC = '/api/feature-flags'
const ADMIN = '/api/admin/feature-flags'

export const featureFlagsApi = {
  /** Resolve one flag for an audience. No auth required. */
  check: (key: string, audience?: string) => {
    const url = audience
      ? `${PUBLIC}/check/${encodeURIComponent(key)}?audience=${encodeURIComponent(audience)}`
      : `${PUBLIC}/check/${encodeURIComponent(key)}`
    return apiFetch<CheckResponse>(url)
  },

  /** Resolved snapshot for an audience — key + enabled, no rollout / audience leak. */
  list: (audience?: string) => {
    const url = audience
      ? `${PUBLIC}?audience=${encodeURIComponent(audience)}`
      : PUBLIC
    return apiFetch<PublicListResponse>(url)
  },

  /** Full admin list — includes rollout %, audiences, timestamps. */
  adminList: () => apiFetch<FlagListResponse>(ADMIN),
  create: (body: FlagCreateInput) =>
    apiFetch<FeatureFlag>(ADMIN, { method: 'POST', body }),
  update: (id: string, body: FlagUpdateInput) =>
    apiFetch<FeatureFlag>(`${ADMIN}/${id}`, { method: 'PATCH', body }),
  remove: (id: string) =>
    apiFetch<void>(`${ADMIN}/${id}`, { method: 'DELETE' }),
}
