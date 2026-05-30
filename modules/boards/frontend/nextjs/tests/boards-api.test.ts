/**
 * boards API client smoke — verifies the typed client builds the right
 * requests and parses canonical responses. Doesn't hit the network.
 */
import { describe, expect, it, vi } from 'vitest'
import { boardsApi, type Board, type Card } from '@/lib/api/boards'

const BOARD: Board = {
  id: 'b-1',
  ownerId: 'u-1',
  name: 'My board',
  slug: 'my-board',
  description: null,
  columns: ['todo', 'doing', 'done'],
  createdAt: '2026-05-18T00:00:00Z',
  updatedAt: '2026-05-18T00:00:00Z',
}

const CARD: Card = {
  id: 'c-1',
  boardId: 'b-1',
  title: 'Ship it',
  body: null,
  status: 'todo',
  position: 0,
  assigneeId: null,
  dueAt: null,
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

describe('boardsApi', () => {
  it('list() GETs /api/boards', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [BOARD], total: 1 }))

    const res = await boardsApi.list()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards')
    expect(init?.method ?? 'GET').toBe('GET')
    expect(res.total).toBe(1)
  })

  it('get(slug) accepts a slug + GETs by ref', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...BOARD, cards: [CARD] }))

    const res = await boardsApi.get('my-board')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards/my-board')
    expect(res.cards[0].id).toBe('c-1')
  })

  it('create() POSTs the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(BOARD, 201))

    await boardsApi.create({
      name: 'My board',
      slug: 'my-board',
      columns: ['todo', 'done'],
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).columns).toEqual(['todo', 'done'])
  })

  it('createCard() POSTs to /boards/<id>/cards', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(CARD, 201))

    await boardsApi.createCard('b-1', { title: 'Ship it', status: 'todo' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards/b-1/cards')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).title).toBe('Ship it')
  })

  it('moveCard() PATCHes /cards/<id>/move with status+position', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...CARD, status: 'done', position: 3 }))

    const res = await boardsApi.moveCard('c-1', { status: 'done', position: 3 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards/cards/c-1/move')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({
      status: 'done',
      position: 3,
    })
    expect(res.status).toBe('done')
    expect(res.position).toBe(3)
  })

  it('removeCard() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await boardsApi.removeCard('c-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/boards/cards/c-1')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
