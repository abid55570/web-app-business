import { apiFetch } from './client'

export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push'
  | 'in-app'

export type NotificationStatus = 'sent' | 'sent-test' | 'failed' | 'skipped'

export type NotificationLog = {
  id: string
  channel: NotificationChannel
  recipient: string
  template: string
  payload: Record<string, unknown> | null
  status: NotificationStatus
  providerId: string | null
  error: string | null
  triggeredByEvent: string | null
  sentAt: string
}

export type NotificationListResponse = {
  notifications: NotificationLog[]
  total: number
}

export const notificationsApi = {
  adminList: (params?: { channel?: NotificationChannel; event?: string }) => {
    const q = new URLSearchParams()
    if (params?.channel) q.set('channel', params.channel)
    if (params?.event) q.set('event', params.event)
    const qs = q.toString()
    return apiFetch<NotificationListResponse>(
      `/api/admin/notifications${qs ? `?${qs}` : ''}`,
    )
  },
}
