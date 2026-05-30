/**
 * ws-core API client smoke — verifies the URL builder + broadcast helper.
 */
import { describe, expect, it, vi } from 'vitest'
import { wsApi } from '@/lib/api/ws'

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('wsApi', () => {
  it('connect() builds ws://host/api/ws/<room>?token=…', () => {
    const orig = (globalThis as any).WebSocket
    const calls: string[] = []
    ;(globalThis as any).WebSocket = class {
      constructor(url: string) {
        calls.push(url)
      }
    }
    try {
      wsApi.connect('lobby', 'jwt.token', { baseUrl: 'ws://api.example.com' })
      expect(calls[0]).toBe('ws://api.example.com/api/ws/lobby?token=jwt.token')
    } finally {
      ;(globalThis as any).WebSocket = orig
    }
  })

  it('connect() URL-encodes room + token', () => {
    const orig = (globalThis as any).WebSocket
    const calls: string[] = []
    ;(globalThis as any).WebSocket = class {
      constructor(url: string) {
        calls.push(url)
      }
    }
    try {
      wsApi.connect('rooms/with slash', 'jwt:colon', {
        baseUrl: 'ws://api',
      })
      expect(calls[0]).toBe('ws://api/api/ws/rooms%2Fwith%20slash?token=jwt%3Acolon')
    } finally {
      ;(globalThis as any).WebSocket = orig
    }
  })

  it('broadcast() POSTs to /api/ws/broadcast', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ room: 'lobby', recipients: 3 }))

    const res = await wsApi.broadcast({
      room: 'lobby',
      message: { type: 'ping' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ws/broadcast')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).room).toBe('lobby')
    expect(res.recipients).toBe(3)
  })

  it('adminRooms() GETs /api/ws/rooms', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await wsApi.adminRooms()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ws/rooms')
  })
})
