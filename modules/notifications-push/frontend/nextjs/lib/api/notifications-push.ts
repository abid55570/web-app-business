import { apiFetch } from './client'

export type PushSubscriptionRow = {
  id: string
  userId: string
  endpoint: string
  createdAt: string
  updatedAt: string
}

export type PushSubscribeInput = {
  endpoint: string
  p256dhKey: string
  authKey: string
}

export type SendResponse = {
  userId: string
  deliveredCount: number
  expiredCount: number
}

const BASE = '/api/notifications/push'

export const notificationsPushApi = {
  vapidKey: () => apiFetch<{ publicKey: string }>(`${BASE}/vapid-public-key`),

  subscribe: (body: PushSubscribeInput) =>
    apiFetch<PushSubscriptionRow>(`${BASE}/subscriptions`, {
      method: 'POST',
      body,
    }),

  unsubscribe: (endpoint: string) =>
    apiFetch<void>(
      `${BASE}/subscriptions?endpoint=${encodeURIComponent(endpoint)}`,
      { method: 'DELETE' },
    ),

  my: () =>
    apiFetch<{ items: PushSubscriptionRow[]; total: number }>(
      `${BASE}/subscriptions/my`,
    ),

  /** Admin only — fan out a payload to every active subscription of `userId`. */
  send: (userId: string, payload: unknown) =>
    apiFetch<SendResponse>(`${BASE}/send`, {
      method: 'POST',
      body: { userId, payload },
    }),
}
