/**
 * menu API client smoke — verifies the typed client builds the right
 * requests and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { menuApi, type MenuItem } from '@/lib/api/menu'

const SAMPLE: MenuItem = {
  id: 'mi-1',
  name: 'Margherita',
  description: 'Tomato + mozzarella',
  price: 12.5,
  currency: 'USD',
  imageUrl: null,
  category: 'pizza',
  isAvailable: true,
  sortOrder: 0,
  createdAt: '2026-05-09T00:00:00Z',
  updatedAt: '2026-05-09T00:00:00Z',
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('menuApi', () => {
  it('list() GETs /api/menu and returns the parsed list', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [SAMPLE], total: 1 }))

    const res = await menuApi.list()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/menu')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(res.total).toBe(1)
    expect(res.items[0].name).toBe('Margherita')
  })

  it('list(category) appends the query string url-encoded', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await menuApi.list('pizza')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/menu?category=pizza')
  })

  it('create() POSTs JSON body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(SAMPLE, 201))

    const created = await menuApi.create({
      name: 'Margherita',
      price: 12.5,
      category: 'pizza',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/menu')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).name).toBe('Margherita')
    expect(created.id).toBe('mi-1')
  })

  it('setAvailability() PATCHes /availability with isAvailable flag', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...SAMPLE, isAvailable: false }))

    const res = await menuApi.setAvailability('mi-1', false)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/menu/mi-1/availability')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ isAvailable: false })
    expect(res.isAvailable).toBe(false)
  })

  it('remove() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await menuApi.remove('mi-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/menu/mi-1')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
