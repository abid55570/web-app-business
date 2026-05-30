/**
 * telemetry-posthog API client smoke.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initBrowserPosthog, posthogApi } from '@/lib/api/telemetry-posthog'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}


describe('posthogApi', () => {
  it('health() GETs /telemetry/posthog/health', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ enabled: true, host: 'https://us.posthog.com' }),
      )

    await posthogApi.health()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/posthog/health')
  })

  it('track() POSTs the event', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ event: 'signup.completed', outcome: 'delivered' }),
      )

    await posthogApi.track({
      event: 'signup.completed',
      properties: { plan: 'pro' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/posthog/track')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).event).toBe('signup.completed')
  })
})


describe('initBrowserPosthog', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window
  })

  it('refuses when apiKey is empty', () => {
    ;(globalThis as Record<string, unknown>).window = {}
    initBrowserPosthog({ apiKey: '' })
    expect(
      (globalThis as { window: { __posthogInit?: unknown } }).window
        .__posthogInit,
    ).toBeUndefined()
  })

  it('stashes config on window when apiKey is set', () => {
    ;(globalThis as Record<string, unknown>).window = {}
    initBrowserPosthog({ apiKey: 'phc_abc', capturePageviews: false })
    const init = (
      globalThis as {
        window: { __posthogInit?: { apiKey: string; capturePageviews?: boolean } }
      }
    ).window.__posthogInit
    expect(init?.apiKey).toBe('phc_abc')
    expect(init?.capturePageviews).toBe(false)
  })
})
