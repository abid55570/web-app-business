/**
 * notifications-push API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { notificationsPushApi } from '@/lib/api/notifications-push'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('notificationsPushApi', () => {
  it('vapidKey() GETs the public key', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ publicKey: 'BG7...' }))

    const res = await notificationsPushApi.vapidKey()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/notifications/push/vapid-public-key')
    expect(res.publicKey).toBe('BG7...')
  })

  it('subscribe() POSTs the subscription', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ id: 's-1' }, 201))

    await notificationsPushApi.subscribe({
      endpoint: 'https://x',
      p256dhKey: 'k1',
      authKey: 'k2',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/notifications/push/subscriptions')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).p256dhKey).toBe('k1')
  })

  it('unsubscribe() DELETEs with endpoint query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    await notificationsPushApi.unsubscribe('https://x/abc')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(
      '/api/notifications/push/subscriptions?endpoint=https%3A%2F%2Fx%2Fabc',
    )
    expect(init?.method).toBe('DELETE')
  })

  it('send() POSTs to admin /send', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ userId: 'u-1', deliveredCount: 2, expiredCount: 0 }),
      )

    await notificationsPushApi.send('u-1', { title: 'Hi' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/notifications/push/send')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).userId).toBe('u-1')
  })
})
