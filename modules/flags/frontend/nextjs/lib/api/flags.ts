import { apiFetch } from './client'

export type FlagStatus = 'open' | 'resolved' | 'dismissed'

export type Flag = {
  id: string
  reporterId: string
  targetType: string
  targetId: string
  reason: string
  status: FlagStatus
  resolverId: string | null
  resolverNote: string | null
  createdAt: string
  updatedAt: string
}

export type FlagCreateInput = {
  targetType: string
  targetId: string
  reason: 'spam' | 'abuse' | 'off-topic' | 'illegal' | 'other'
}

export type FlagListResponse = {
  items: Flag[]
  total: number
}

const PUBLIC = '/api/flags'
const ADMIN = '/api/admin/flags'

export const flagsApi = {
  /** Report a target. Auth required. Idempotent per (reporter, target). */
  open: (body: FlagCreateInput) =>
    apiFetch<Flag>(PUBLIC, { method: 'POST', body }),

  /** Admin queue with optional status + targetType filter. */
  adminList: (opts: { status?: FlagStatus; targetType?: string } = {}) => {
    const qs = new URLSearchParams()
    if (opts.status) qs.set('status', opts.status)
    if (opts.targetType) qs.set('targetType', opts.targetType)
    const url = qs.toString() ? `${ADMIN}?${qs}` : ADMIN
    return apiFetch<FlagListResponse>(url)
  },

  /** All flags on one target (admin only). */
  forTarget: (targetType: string, targetId: string) =>
    apiFetch<FlagListResponse>(
      `${ADMIN}/for-target?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),

  /** Resolve or dismiss a flag (admin only). */
  resolve: (id: string, status: 'resolved' | 'dismissed', note?: string) =>
    apiFetch<Flag>(`${ADMIN}/${id}`, {
      method: 'PATCH',
      body: { status, resolverNote: note ?? null },
    }),
}
