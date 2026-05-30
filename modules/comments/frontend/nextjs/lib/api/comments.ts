import { apiFetch } from './client'

export type CommentStatus = 'visible' | 'hidden' | 'flagged'

export type Comment = {
  id: string
  authorId: string
  targetType: string
  targetId: string
  parentId: string | null
  body: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

export type CommentCreateInput = {
  targetType: string
  targetId: string
  body: string
  parentId?: string | null
}

export type CommentListResponse = {
  items: Comment[]
  total: number
}

const PUBLIC = '/api/comments'
const ADMIN = '/api/admin/comments'

export const commentsApi = {
  listFor: (targetType: string, targetId: string) =>
    apiFetch<CommentListResponse>(
      `${PUBLIC}?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),
  create: (body: CommentCreateInput) =>
    apiFetch<Comment>(PUBLIC, { method: 'POST', body }),
  updateOwn: (id: string, body: string) =>
    apiFetch<Comment>(`${PUBLIC}/${id}`, { method: 'PATCH', body: { body } }),
  removeOwn: (id: string) =>
    apiFetch<void>(`${PUBLIC}/${id}`, { method: 'DELETE' }),

  adminList: (opts: { status?: CommentStatus; targetType?: string } = {}) => {
    const qs = new URLSearchParams()
    if (opts.status) qs.set('status', opts.status)
    if (opts.targetType) qs.set('targetType', opts.targetType)
    const url = qs.toString() ? `${ADMIN}?${qs}` : ADMIN
    return apiFetch<CommentListResponse>(url)
  },
  moderate: (id: string, status: CommentStatus) =>
    apiFetch<Comment>(`${ADMIN}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  adminRemove: (id: string) =>
    apiFetch<void>(`${ADMIN}/${id}`, { method: 'DELETE' }),
}
