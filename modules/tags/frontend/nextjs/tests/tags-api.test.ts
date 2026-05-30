/**
 * tags API client smoke — verifies typed client builds correct requests
 * and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { tagsApi, type Tag } from '@/lib/api/tags'

const TAG: Tag = {
  id: 't-1',
  slug: 'feature',
  label: 'Feature',
  description: null,
  color: '#22c55e',
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

describe('tagsApi', () => {
  it('list() GETs /api/tags', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [TAG], total: 1 }))

    const res = await tagsApi.list()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tags')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(res.total).toBe(1)
  })

  it('forTarget() URL-encodes both target params', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ targetType: 'post', targetId: 'p-1', tags: [TAG] }),
      )

    const res = await tagsApi.forTarget('post', 'p-1 hello')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tags/for-target?targetType=post&targetId=p-1%20hello')
    expect(res.tags[0].slug).toBe('feature')
  })

  it('create() POSTs to admin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(TAG, 201))

    await tagsApi.create({ slug: 'feature', label: 'Feature' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/tags')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).slug).toBe('feature')
  })

  it('assign() POSTs the (tagId, target) tuple', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ targetType: 'post', targetId: 'p-1', tags: [TAG] }, 201),
      )

    await tagsApi.assign('t-1', 'post', 'p-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/tags/assign')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      tagId: 't-1',
      targetType: 'post',
      targetId: 'p-1',
    })
  })

  it('unassign() DELETEs with the (tagId, target) tuple as query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    await tagsApi.unassign('t-1', 'post', 'p-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(
      '/api/admin/tags/assign?tagId=t-1&targetType=post&targetId=p-1',
    )
    expect(init?.method).toBe('DELETE')
  })

  it('targetsFor() with optional targetType filter', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ tag: TAG, targets: [] }))

    await tagsApi.targetsFor('t-1', 'post')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tags/t-1/targets?targetType=post')
  })
})
