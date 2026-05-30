/**
 * bookmarks API client smoke — verifies typed client builds correct requests
 * and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { bookmarksApi, type Bookmark } from '@/lib/api/bookmarks'

const SAVED: Bookmark = {
  id: 'b-1',
  targetType: 'post',
  targetId: 'p-1',
  note: null,
  createdAt: '2026-05-18T00:00:00Z',
  updatedAt: '2026-05-18T00:00:00Z',
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('bookmarksApi', () => {
  it('save() POSTs the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAVED, 201))

    await bookmarksApi.save({
      targetType: 'post',
      targetId: 'p-1',
      note: 'read later',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/bookmarks')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      targetType: 'post',
      targetId: 'p-1',
      note: 'read later',
    })
  })

  it('remove() DELETEs with target query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    await bookmarksApi.remove('post', 'p 1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/bookmarks?targetType=post&targetId=p%201')
    expect(init?.method).toBe('DELETE')
  })

  it('check() returns bookmarked flag', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ targetType: 'post', targetId: 'p-1', bookmarked: true }),
      )

    const res = await bookmarksApi.check('post', 'p-1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/bookmarks/check?targetType=post&targetId=p-1')
    expect(res.bookmarked).toBe(true)
  })

  it('my() optional targetType filter', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await bookmarksApi.my('post')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/bookmarks/my?targetType=post')
  })

  it('my() without filter hits /bookmarks/my', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await bookmarksApi.my()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/bookmarks/my')
  })
})
