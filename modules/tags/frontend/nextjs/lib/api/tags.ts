import { apiFetch } from './client'

export type Tag = {
  id: string
  slug: string
  label: string
  description: string | null
  color: string | null
  createdAt: string
  updatedAt: string
}

export type TagInput = {
  slug: string
  label: string
  description?: string | null
  color?: string | null
}

export type TagListResponse = {
  items: Tag[]
  total: number
}

export type TagsForTarget = {
  targetType: string
  targetId: string
  tags: Tag[]
}

export type TargetsForTag = {
  tag: Tag
  targets: { targetType: string; targetId: string }[]
}

const PUBLIC = '/api/tags'
const ADMIN = '/api/admin/tags'

export const tagsApi = {
  list: () => apiFetch<TagListResponse>(PUBLIC),
  getBySlug: (slug: string) =>
    apiFetch<Tag>(`${PUBLIC}/by-slug/${encodeURIComponent(slug)}`),
  forTarget: (targetType: string, targetId: string) =>
    apiFetch<TagsForTarget>(
      `${PUBLIC}/for-target?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),
  targetsFor: (tagId: string, targetType?: string) => {
    const url = targetType
      ? `${PUBLIC}/${tagId}/targets?targetType=${encodeURIComponent(targetType)}`
      : `${PUBLIC}/${tagId}/targets`
    return apiFetch<TargetsForTag>(url)
  },

  adminList: () => apiFetch<TagListResponse>(ADMIN),
  create: (body: TagInput) => apiFetch<Tag>(ADMIN, { method: 'POST', body }),
  update: (id: string, body: Partial<TagInput>) =>
    apiFetch<Tag>(`${ADMIN}/${id}`, { method: 'PATCH', body }),
  remove: (id: string) =>
    apiFetch<void>(`${ADMIN}/${id}`, { method: 'DELETE' }),

  assign: (tagId: string, targetType: string, targetId: string) =>
    apiFetch<TagsForTarget>(`${ADMIN}/assign`, {
      method: 'POST',
      body: { tagId, targetType, targetId },
    }),
  unassign: (tagId: string, targetType: string, targetId: string) =>
    apiFetch<void>(
      `${ADMIN}/assign?tagId=${encodeURIComponent(tagId)}&targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
      { method: 'DELETE' },
    ),
}
