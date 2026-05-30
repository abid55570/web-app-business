import { apiFetch } from './client'

export type Board = {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string | null
  columns: string[]
  createdAt: string
  updatedAt: string
}

export type BoardWithCards = Board & { cards: Card[] }

export type Card = {
  id: string
  boardId: string
  title: string
  body: string | null
  status: string
  position: number
  assigneeId: string | null
  dueAt: string | null
  createdAt: string
  updatedAt: string
}

export type BoardCreateInput = {
  name: string
  slug: string
  description?: string | null
  columns?: string[]
}

export type BoardUpdateInput = Partial<BoardCreateInput>

export type CardCreateInput = {
  title: string
  body?: string | null
  status: string
  position?: number
  assigneeId?: string | null
  dueAt?: string | null
}

export type CardUpdateInput = {
  title?: string
  body?: string | null
  assigneeId?: string | null
  dueAt?: string | null
}

export type CardMoveInput = {
  status: string
  position: number
}

export type BoardListResponse = {
  items: Board[]
  total: number
}

const BASE = '/api/boards'

export const boardsApi = {
  list: () => apiFetch<BoardListResponse>(BASE),
  get: (slugOrId: string) => apiFetch<BoardWithCards>(`${BASE}/${slugOrId}`),
  create: (body: BoardCreateInput) =>
    apiFetch<Board>(BASE, { method: 'POST', body }),
  update: (id: string, body: BoardUpdateInput) =>
    apiFetch<Board>(`${BASE}/${id}`, { method: 'PATCH', body }),
  remove: (id: string) =>
    apiFetch<void>(`${BASE}/${id}`, { method: 'DELETE' }),

  createCard: (boardId: string, body: CardCreateInput) =>
    apiFetch<Card>(`${BASE}/${boardId}/cards`, { method: 'POST', body }),
  updateCard: (cardId: string, body: CardUpdateInput) =>
    apiFetch<Card>(`${BASE}/cards/${cardId}`, { method: 'PATCH', body }),
  moveCard: (cardId: string, body: CardMoveInput) =>
    apiFetch<Card>(`${BASE}/cards/${cardId}/move`, { method: 'PATCH', body }),
  removeCard: (cardId: string) =>
    apiFetch<void>(`${BASE}/cards/${cardId}`, { method: 'DELETE' }),
}
