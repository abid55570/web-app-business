/**
 * comments API client smoke — verifies the typed client builds the right
 * requests and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { commentsApi, type Comment } from '@/lib/api/comments'

const SAMPLE: Comment = {
  id: 'c-1',
  authorId: 'u-1',
  targetType: 'post',
  targetId: 'p-1',
  parentId: null,
  body: 'First!',
  status: 'visible',
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

describe('commentsApi', () => {
  it('listFor() GETs /api/comments with target query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [SAMPLE], total: 1 }))

    const res = await commentsApi.listFor('post', 'p-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/comments?targetType=post&targetId=p-1')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(res.total).toBe(1)
  })

  it('listFor() URL-encodes the target ids', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await commentsApi.listFor('issue', 'has spaces')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/comments?targetType=issue&targetId=has%20spaces')
  })

  it('create() POSTs JSON body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE, 201))

    await commentsApi.create({
      targetType: 'post',
      targetId: 'p-1',
      body: 'First!',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/comments')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).targetType).toBe('post')
  })

  it('updateOwn() PATCHes with wrapped body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...SAMPLE, body: 'edited' }))

    await commentsApi.updateOwn('c-1', 'edited')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/comments/c-1')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ body: 'edited' })
  })

  it('moderate() PATCHes admin /status with the new status', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...SAMPLE, status: 'hidden' }))

    const res = await commentsApi.moderate('c-1', 'hidden')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/comments/c-1/status')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'hidden' })
    expect(res.status).toBe('hidden')
  })

  it('adminList() builds query string from opts', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await commentsApi.adminList({ status: 'flagged', targetType: 'post' })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/comments?status=flagged&targetType=post')
  })

  it('removeOwn() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await commentsApi.removeOwn('c-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/comments/c-1')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
