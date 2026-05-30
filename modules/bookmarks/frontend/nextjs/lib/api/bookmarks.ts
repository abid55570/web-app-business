import { apiFetch } from './client'

export type Bookmark = {
  id: string
  targetType: string
  targetId: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type BookmarkSaveInput = {
  targetType: string
  targetId: string
  note?: string | null
}

export type BookmarkListResponse = {
  items: Bookmark[]
  total: number
}

export type BookmarkCheck = {
  targetType: string
  targetId: string
  bookmarked: boolean
}

const BASE = '/api/bookmarks'

export const bookmarksApi = {
  /** Save (idempotent — if already saved with a different note, updates note). */
  save: (body: BookmarkSaveInput) =>
    apiFetch<Bookmark>(BASE, { method: 'POST', body }),

  /** Remove (idempotent). */
  remove: (targetType: string, targetId: string) =>
    apiFetch<void>(
      `${BASE}?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
      { method: 'DELETE' },
    ),

  /** Is this `(targetType,targetId)` saved by the caller? */
  check: (targetType: string, targetId: string) =>
    apiFetch<BookmarkCheck>(
      `${BASE}/check?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),

  /** Caller's saves, newest first. Optional targetType filter. */
  my: (targetType?: string) => {
    const url = targetType
      ? `${BASE}/my?targetType=${encodeURIComponent(targetType)}`
      : `${BASE}/my`
    return apiFetch<BookmarkListResponse>(url)
  },
}
