import { apiFetch } from './client'

export type WsBroadcastInput = {
  room: string
  message: unknown
}

export type WsBroadcastResponse = {
  room: string
  recipients: number
}

export type WsRoomStats = {
  room: string
  connections: number
}

export type WsRoomsResponse = {
  items: WsRoomStats[]
  total: number
}

const BASE = '/api/ws'

export const wsApi = {
  /** Open a websocket to `/ws/<room>?token=<jwt>`. Caller is responsible
   * for handshake + reconnect; this is a thin builder helper. */
  connect(room: string, token: string, opts: { baseUrl?: string } = {}): WebSocket {
    const base =
      opts.baseUrl ??
      (typeof location !== 'undefined'
        ? location.origin.replace(/^http/, 'ws')
        : 'ws://localhost:8000')
    const url = `${base}/api/ws/${encodeURIComponent(room)}?token=${encodeURIComponent(token)}`
    return new WebSocket(url)
  },

  /** HTTP broadcast — push a message into a room from any signed-in user. */
  broadcast: (body: WsBroadcastInput) =>
    apiFetch<WsBroadcastResponse>(`${BASE}/broadcast`, {
      method: 'POST',
      body,
    }),

  /** Admin only — current rooms + conn counts. */
  adminRooms: () => apiFetch<WsRoomsResponse>(`${BASE}/rooms`),
}
