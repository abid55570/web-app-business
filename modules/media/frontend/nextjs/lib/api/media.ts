import { apiFetch } from './client'

export type MediaKind = 'image' | 'video' | 'file'

export type Media = {
  id: string
  ownerId: string
  kind: MediaKind
  originalName: string | null
  mimeType: string
  sizeBytes: number
  url: string
  thumbUrl: string | null
  width: number | null
  height: number | null
  altText: string | null
  createdAt: string
  updatedAt: string
}

export type MediaRegisterInput = {
  kind?: MediaKind
  originalName?: string | null
  mimeType: string
  sizeBytes: number
  url: string
  thumbUrl?: string | null
  width?: number | null
  height?: number | null
  altText?: string | null
}

export type MediaUpdateInput = {
  altText?: string | null
  thumbUrl?: string | null
}

export type MediaListResponse = {
  items: Media[]
  total: number
}

const BASE = '/api/media'

export const mediaApi = {
  /** Public list. Optional owner / kind filters. */
  list: (opts: { ownerId?: string; kind?: MediaKind } = {}) => {
    const qs = new URLSearchParams()
    if (opts.ownerId) qs.set('ownerId', opts.ownerId)
    if (opts.kind) qs.set('kind', opts.kind)
    const url = qs.toString() ? `${BASE}?${qs}` : BASE
    return apiFetch<MediaListResponse>(url)
  },
  /** Public detail. */
  get: (id: string) => apiFetch<Media>(`${BASE}/${id}`),
  /** Caller's own assets. Auth required. */
  my: () => apiFetch<MediaListResponse>(`${BASE}/my`),

  /** Register metadata for an already-uploaded asset. Auth required. */
  register: (body: MediaRegisterInput) =>
    apiFetch<Media>(BASE, { method: 'POST', body }),
  /** Owner-only — edit alt text or thumbnail URL. */
  update: (id: string, body: MediaUpdateInput) =>
    apiFetch<Media>(`${BASE}/${id}`, { method: 'PATCH', body }),
  /** Owner-only delete. */
  remove: (id: string) =>
    apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
