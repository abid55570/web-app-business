import { apiFetch } from './client'

export type AuditEntry = {
  id: string
  actorId: string
  action: string
  targetType: string | null
  targetId: string | null
  metadata: Record<string, unknown>
  ip: string | null
  userAgent: string | null
  createdAt: string
}

export type AuditRecordInput = {
  action: string
  targetType?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown> | null
}

export type AuditListResponse = {
  items: AuditEntry[]
  total: number
}

export type AuditQuery = {
  actorId?: string
  action?: string
  targetType?: string
  targetId?: string
  from?: string
  to?: string
  limit?: number
}

const PUBLIC = '/api/audit'
const ADMIN = '/api/admin/audit'

export const auditApi = {
  /** Append an audit entry for the current user. Auth required. */
  record: (body: AuditRecordInput) =>
    apiFetch<AuditEntry>(PUBLIC, { method: 'POST', body }),

  /** Admin-only read with optional filters. */
  list: (q: AuditQuery = {}) => {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(q)) {
      if (v != null) qs.set(k, String(v))
    }
    const url = qs.toString() ? `${ADMIN}?${qs}` : ADMIN
    return apiFetch<AuditListResponse>(url)
  },
}
