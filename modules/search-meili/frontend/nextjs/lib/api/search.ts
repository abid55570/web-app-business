import { apiFetch } from './client'

export type SearchHit = Record<string, unknown> & { id: string }

export type SearchResponse = {
  hits: SearchHit[]
  total: number
  processingTimeMs: number
  query: string
  offset: number
  limit: number
}

export type IndexBody = {
  index: string
  documentId: string
  document: Record<string, unknown>
}

export type DeleteBody = {
  index: string
  documentId: string
}

export type StatsResponse = {
  host: string
  indexes: Record<string, { documents: number }>
}

const PUBLIC = '/api/search'
const ADMIN = '/api/admin/search'

export const searchApi = {
  /** Public search. `q` empty → list mode (all docs, paginated). */
  search: (
    index: string,
    q: string,
    opts: { limit?: number; offset?: number } = {},
  ) => {
    const qs = new URLSearchParams({ q })
    if (opts.limit != null) qs.set('limit', String(opts.limit))
    if (opts.offset != null) qs.set('offset', String(opts.offset))
    return apiFetch<SearchResponse>(
      `${PUBLIC}/${encodeURIComponent(index)}?${qs}`,
    )
  },

  /** Admin upsert. */
  index: (body: IndexBody) =>
    apiFetch<{ index: string; documentId: string; indexed: boolean }>(
      `${ADMIN}/index`,
      { method: 'POST', body },
    ),

  /** Admin delete. */
  remove: (body: DeleteBody) =>
    apiFetch<void>(`${ADMIN}/index`, { method: 'DELETE', body }),

  /** Admin stats — host + doc count per index. */
  stats: () => apiFetch<StatsResponse>(`${ADMIN}/stats`),
}
