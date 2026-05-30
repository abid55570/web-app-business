import { apiFetch } from './client'

export type TargetRef = {
  targetType: string
  targetId: string
}

export type LikeResult = TargetRef & {
  liked: boolean
  count: number
}

export type LikeCount = TargetRef & {
  count: number
  likedByMe: boolean
}

export type MyLike = TargetRef & { createdAt: string }

export type MyLikesResponse = {
  items: MyLike[]
  total: number
}

const BASE = '/api/likes'

export const likesApi = {
  /** Toggle: like if absent, unlike if present. Auth required. */
  toggle: (targetType: string, targetId: string) =>
    apiFetch<LikeResult>(BASE, {
      method: 'POST',
      body: { targetType, targetId },
    }),

  /** Explicit unlike — idempotent. Auth required. */
  remove: (targetType: string, targetId: string) =>
    apiFetch<LikeResult>(
      `${BASE}?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
      { method: 'DELETE' },
    ),

  /** Anonymous-tolerant. `likedByMe` only true when a valid session is sent. */
  forTarget: (targetType: string, targetId: string) =>
    apiFetch<LikeCount>(
      `${BASE}/for-target?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
    ),

  /** Caller's own likes (optionally filtered by targetType). Auth required. */
  my: (targetType?: string) => {
    const url = targetType
      ? `${BASE}/my?targetType=${encodeURIComponent(targetType)}`
      : `${BASE}/my`
    return apiFetch<MyLikesResponse>(url)
  },
}
