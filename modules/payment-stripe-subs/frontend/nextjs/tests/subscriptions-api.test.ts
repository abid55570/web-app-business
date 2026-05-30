/**
 * payment-stripe-subs API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { subscriptionsApi } from '@/lib/api/subscriptions'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('subscriptionsApi', () => {
  it('plans() GETs /api/plans', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await subscriptionsApi.plans()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/plans')
  })

  it('checkout() POSTs the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ sessionId: 'cs_1', checkoutUrl: 'https://x' }),
      )

    await subscriptionsApi.checkout({
      planKey: 'pro',
      customerRef: 't-1',
      successUrl: 'https://app/ok',
      cancelUrl: 'https://app/cancel',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/subscriptions/checkout')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).planKey).toBe('pro')
  })

  it('portal() POSTs customerRef', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ portalUrl: 'https://x' }))

    await subscriptionsApi.portal({ customerRef: 't-1' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/subscriptions/portal')
    expect(init?.method).toBe('POST')
  })

  it('active(ref) GETs URL-encoded ref', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson(null))

    await subscriptionsApi.active('tenant a')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/subscriptions/active/tenant%20a')
  })

  it('createPlan() POSTs to admin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ id: 'p-1' }, 201))

    await subscriptionsApi.createPlan({
      key: 'pro',
      name: 'Pro',
      description: null,
      amountCents: 1900,
      currency: 'USD',
      interval: 'month',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/plans')
    expect(init?.method).toBe('POST')
  })
})
