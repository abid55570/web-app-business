/**
 * search-meili API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { searchApi } from '@/lib/api/search'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('searchApi', () => {
  it('search() builds GET URL with q + paging', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({
          hits: [],
          total: 0,
          processingTimeMs: 0,
          query: 'foo',
          offset: 0,
          limit: 10,
        }),
      )

    await searchApi.search('posts', 'foo', { limit: 10 })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/search/posts?q=foo&limit=10')
  })

  it('search() URL-encodes index + query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({
          hits: [],
          total: 0,
          processingTimeMs: 0,
          query: 'a b',
          offset: 0,
          limit: 20,
        }),
      )

    await searchApi.search('my-idx', 'a b')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/search/my-idx?q=a+b')
  })

  it('index() POSTs to admin /index', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ index: 'posts', documentId: 'p-1', indexed: true }, 201),
      )

    await searchApi.index({
      index: 'posts',
      documentId: 'p-1',
      document: { title: 'Hi' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/search/index')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).documentId).toBe('p-1')
  })

  it('remove() DELETEs with body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    await searchApi.remove({ index: 'posts', documentId: 'p-1' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/search/index')
    expect(init?.method).toBe('DELETE')
  })
})
