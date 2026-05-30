/**
 * flags API client smoke — verifies typed client builds correct requests.
 */
import { describe, expect, it, vi } from 'vitest'
import { flagsApi, type Flag } from '@/lib/api/flags'

const F: Flag = {
  id: 'f-1',
  reporterId: 'u-1',
  targetType: 'post',
  targetId: 'p-1',
  reason: 'spam',
  status: 'open',
  resolverId: null,
  resolverNote: null,
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

describe('flagsApi', () => {
  it('open() POSTs the body to public', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(F, 201))

    await flagsApi.open({ targetType: 'post', targetId: 'p-1', reason: 'spam' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/flags')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).reason).toBe('spam')
  })

  it('adminList() builds filter query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await flagsApi.adminList({ status: 'open', targetType: 'post' })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/flags?status=open&targetType=post')
  })

  it('resolve() PATCHes with status + note', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ ...F, status: 'resolved', resolverNote: 'removed' }),
      )

    await flagsApi.resolve('f-1', 'resolved', 'removed')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/flags/f-1')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({
      status: 'resolved',
      resolverNote: 'removed',
    })
  })

  it('forTarget() encodes the target params', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await flagsApi.forTarget('post', 'p 1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/flags/for-target?targetType=post&targetId=p%201')
  })
})
