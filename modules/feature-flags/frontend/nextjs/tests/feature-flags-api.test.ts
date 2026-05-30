/**
 * feature-flags API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { featureFlagsApi, type FeatureFlag } from '@/lib/api/feature-flags'

const F: FeatureFlag = {
  id: 'f-1',
  key: 'beta-ui',
  description: null,
  enabled: true,
  rolloutPercent: 25,
  audiences: ['tenant:acme'],
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

describe('featureFlagsApi', () => {
  it('check(key) GETs /check/<key> with no audience', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ key: 'beta-ui', enabled: false, audience: null }),
      )

    await featureFlagsApi.check('beta-ui')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/feature-flags/check/beta-ui')
  })

  it('check(key, audience) appends ?audience=', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ key: 'beta-ui', enabled: true, audience: 'tenant:acme' }),
      )

    const res = await featureFlagsApi.check('beta-ui', 'tenant:acme')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/feature-flags/check/beta-ui?audience=tenant%3Aacme')
    expect(res.enabled).toBe(true)
  })

  it('create() POSTs the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(F, 201))

    await featureFlagsApi.create({
      key: 'beta-ui',
      enabled: true,
      rolloutPercent: 25,
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/feature-flags')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).rolloutPercent).toBe(25)
  })

  it('list() with no audience hits /api/feature-flags', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await featureFlagsApi.list()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/feature-flags')
  })

  it('update() PATCHes the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ ...F, rolloutPercent: 50 }))

    await featureFlagsApi.update('f-1', { rolloutPercent: 50 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/feature-flags/f-1')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(init?.body as string)).toEqual({ rolloutPercent: 50 })
  })
})
