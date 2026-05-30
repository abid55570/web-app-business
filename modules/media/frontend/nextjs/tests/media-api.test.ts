/**
 * media API client smoke — verifies typed client builds correct requests.
 */
import { describe, expect, it, vi } from 'vitest'
import { mediaApi, type Media } from '@/lib/api/media'

const M: Media = {
  id: 'm-1',
  ownerId: 'u-1',
  kind: 'image',
  originalName: 'hero.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 12345,
  url: 'https://cdn.example.com/hero.jpg',
  thumbUrl: null,
  width: 1200,
  height: 900,
  altText: null,
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

describe('mediaApi', () => {
  it('list() with no filter hits /api/media', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [M], total: 1 }))

    await mediaApi.list()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/media')
  })

  it('list({ownerId,kind}) builds the query string', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await mediaApi.list({ ownerId: 'u-1', kind: 'video' })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/media?ownerId=u-1&kind=video')
  })

  it('register() POSTs the metadata body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(M, 201))

    await mediaApi.register({
      kind: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 12345,
      url: 'https://cdn.example.com/hero.jpg',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/media')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).url).toBe(
      'https://cdn.example.com/hero.jpg',
    )
  })

  it('update() PATCHes with alt text + thumb', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...M, altText: 'sunset over the bay' }))

    await mediaApi.update('m-1', { altText: 'sunset over the bay' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/media/m-1')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({
      altText: 'sunset over the bay',
    })
  })

  it('remove() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await mediaApi.remove('m-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/media/m-1')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
