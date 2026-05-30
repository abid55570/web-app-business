/**
 * tenants API client smoke — verifies typed client builds correct requests.
 */
import { describe, expect, it, vi } from 'vitest'
import { tenantsApi, type Member, type Tenant } from '@/lib/api/tenants'

const T: Tenant = {
  id: 't-1',
  ownerId: 'u-1',
  name: 'Acme',
  slug: 'acme',
  plan: 'free',
  createdAt: '2026-05-18T00:00:00Z',
  updatedAt: '2026-05-18T00:00:00Z',
}

const M: Member = {
  id: 'm-1',
  tenantId: 't-1',
  userId: 'u-2',
  role: 'member',
  invitedBy: 'u-1',
  joinedAt: '2026-05-18T00:00:00Z',
}

function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('tenantsApi', () => {
  it('my() GETs /tenants/my', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [T], total: 1 }))

    await tenantsApi.my()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tenants/my')
  })

  it('create() POSTs name + slug', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(T, 201))

    await tenantsApi.create({ name: 'Acme', slug: 'acme' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tenants')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).slug).toBe('acme')
  })

  it('invite() POSTs userId + role', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(M, 201))

    await tenantsApi.invite('acme', 'u-2', 'admin')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tenants/acme/members')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      userId: 'u-2',
      role: 'admin',
    })
  })

  it('changeRole() PATCHes /members/{userId}', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...M, role: 'admin' }))

    await tenantsApi.changeRole('acme', 'u-2', 'admin')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tenants/acme/members/u-2')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ role: 'admin' })
  })

  it('removeMember() DELETEs and resolves to undefined on 204', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as unknown as Response)

    const res = await tenantsApi.removeMember('acme', 'u-2')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tenants/acme/members/u-2')
    expect(init?.method).toBe('DELETE')
    expect(res).toBeUndefined()
  })
})
