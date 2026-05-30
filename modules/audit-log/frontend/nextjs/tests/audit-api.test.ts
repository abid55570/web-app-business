/**
 * audit API client smoke — verifies typed client builds correct requests.
 */
import { describe, expect, it, vi } from 'vitest'
import { auditApi, type AuditEntry } from '@/lib/api/audit'

const E: AuditEntry = {
  id: 'a-1',
  actorId: 'u-1',
  action: 'post.publish',
  targetType: 'post',
  targetId: 'p-1',
  metadata: { slug: 'hello' },
  ip: '127.0.0.1',
  userAgent: 'jest',
  createdAt: '2026-05-18T00:00:00Z',
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('auditApi', () => {
  it('record() POSTs the action', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(E, 201))

    await auditApi.record({
      action: 'post.publish',
      targetType: 'post',
      targetId: 'p-1',
      metadata: { slug: 'hello' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/audit')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).action).toBe('post.publish')
  })

  it('list() with no filter hits /admin/audit', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [E], total: 1 }))

    await auditApi.list()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/audit')
  })

  it('list() with filters builds the query string', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await auditApi.list({
      actorId: 'u-1',
      action: 'tenant.invite',
      limit: 50,
    })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe(
      '/api/admin/audit?actorId=u-1&action=tenant.invite&limit=50',
    )
  })
})
