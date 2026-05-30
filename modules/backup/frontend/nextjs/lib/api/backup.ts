import { apiFetch } from './client'

export type JobKind = 'scheduled' | 'manual' | 'restore'
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type BackupJob = {
  id: string
  kind: JobKind
  status: JobStatus
  s3Key: string | null
  sizeBytes: number
  startedAt: string | null
  finishedAt: string | null
  reason: string | null
  createdAt: string
}

export type BackupListResponse = {
  items: BackupJob[]
  total: number
}

const ADMIN = '/api/admin/backup'

export const backupApi = {
  list: (opts: { status?: JobStatus; limit?: number } = {}) => {
    const qs = new URLSearchParams()
    if (opts.status) qs.set('status', opts.status)
    if (opts.limit != null) qs.set('limit', String(opts.limit))
    const url = qs.toString() ? `${ADMIN}?${qs}` : ADMIN
    return apiFetch<BackupListResponse>(url)
  },

  trigger: (kind: JobKind = 'manual') =>
    apiFetch<BackupJob>(`${ADMIN}/trigger`, {
      method: 'POST',
      body: { kind },
    }),

  purge: (retentionDays: number = 30) =>
    apiFetch<{ purged: number }>(
      `${ADMIN}/purge?retentionDays=${retentionDays}`,
      { method: 'POST' },
    ),
}
