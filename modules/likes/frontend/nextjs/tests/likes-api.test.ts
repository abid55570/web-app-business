/**
 * likes API client smoke — verifies typed client builds correct requests
 * and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { likesApi, type LikeResult } from '@/lib/api/likes'

const LIKED: LikeResult = {
  targetType: 'post',
  targetId: 'p-1',
  liked: true,
  count: 1,
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('likesApi', () => {
  it('toggle() POSTs the target tuple', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(LIKED))

    const res = await likesApi.toggle('post', 'p-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/likes')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      targetType: 'post',
      targetId: 'p-1',
    })
    expect(res.liked).toBe(true)
    expect(res.count).toBe(1)
  })

  it('remove() DELETEs with query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...LIKED, liked: false, count: 0 }))

    await likesApi.remove('post', 'p-1 hello')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/likes?targetType=post&targetId=p-1%20hello')
    expect(init?.method).toBe('DELETE')
  })

  it('forTarget() returns count + likedByMe', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({
          targetType: 'post',
          targetId: 'p-1',
          count: 3,
          likedByMe: true,
        }),
      )

    const res = await likesApi.forTarget('post', 'p-1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/likes/for-target?targetType=post&targetId=p-1')
    expect(res.count).toBe(3)
    expect(res.likedByMe).toBe(true)
  })

  it('my() optional targetType filter', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await likesApi.my('post')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/likes/my?targetType=post')
  })

  it('my() without filter hits /likes/my', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await likesApi.my()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/likes/my')
  })
})
