/**
 * backup API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { backupApi } from '@/lib/api/backup'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}


describe('backupApi', () => {
  it('list() builds filter query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await backupApi.list({ status: 'succeeded', limit: 50 })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/backup?status=succeeded&limit=50')
  })

  it('trigger() POSTs kind', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ id: 'j-1', kind: 'manual' }, 201))

    await backupApi.trigger('manual')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/backup/trigger')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).kind).toBe('manual')
  })

  it('purge() POSTs retentionDays as query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ purged: 0 }))

    await backupApi.purge(60)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/backup/purge?retentionDays=60')
    expect(init?.method).toBe('POST')
  })
})
