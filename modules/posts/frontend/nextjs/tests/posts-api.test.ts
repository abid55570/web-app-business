/**
 * posts API client smoke — verifies the typed client builds the right
 * requests and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { postsApi, type Post } from '@/lib/api/posts'

const SAMPLE: Post = {
  id: 'p-1',
  authorId: 'u-1',
  title: 'Hello world',
  slug: 'hello-world',
  body: 'First post body.',
  excerpt: null,
  coverUrl: null,
  status: 'published',
  publishedAt: '2026-05-18T00:00:00Z',
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

describe('postsApi', () => {
  it('list() GETs /api/posts and returns the parsed list', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [SAMPLE], total: 1 }))

    const res = await postsApi.list()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/posts')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(res.total).toBe(1)
    expect(res.items[0].slug).toBe('hello-world')
  })

  it('list(authorId) appends the query string url-encoded', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await postsApi.list('user with spaces')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/posts?authorId=user%20with%20spaces')
  })

  it('getBySlug() GETs /api/posts/<slug>', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE))

    const res = await postsApi.getBySlug('hello-world')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/posts/hello-world')
    expect(res.id).toBe('p-1')
  })

  it('create() POSTs JSON body to admin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE, 201))

    const created = await postsApi.create({
      title: 'Hello world',
      slug: 'hello-world',
      body: 'First post body.',
      status: 'draft',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/posts')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).slug).toBe('hello-world')
    expect(created.id).toBe('p-1')
  })

  it('setStatus() PATCHes /status with the new status', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...SAMPLE, status: 'archived' }))

    const res = await postsApi.setStatus('p-1', 'archived')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/posts/p-1/status')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'archived' })
    expect(res.status).toBe('archived')
  })

  it('remove() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await postsApi.remove('p-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/posts/p-1')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
