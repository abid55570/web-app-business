/**
 * telemetry-sentry API client + browser-init smoke.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initBrowserSentry, sentryApi } from '@/lib/api/telemetry-sentry'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}


describe('sentryApi', () => {
  it('health() GETs /api/telemetry/sentry/health', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ initialized: true }))

    const res = await sentryApi.health()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/sentry/health')
    expect(res.initialized).toBe(true)
  })

  it('capture() POSTs the body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ eventId: 'evt-1', captured: true }),
      )

    await sentryApi.capture({ message: 'boom', level: 'error' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/sentry/capture')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).message).toBe('boom')
  })
})


describe('initBrowserSentry', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window
  })

  it('is a no-op when window is undefined', () => {
    // happy path — function returns void in node
    expect(() =>
      initBrowserSentry({ dsn: 'https://x@y/z' }),
    ).not.toThrow()
  })

  it('stashes config on window in browser mode', () => {
    ;(globalThis as Record<string, unknown>).window = {}
    initBrowserSentry({
      dsn: 'https://x@y/z',
      environment: 'production',
      sampleRate: 0.5,
    })
    expect(
      (
        (globalThis as { window: { __sentryInit?: { dsn: string } } }).window
          .__sentryInit
      )?.dsn,
    ).toBe('https://x@y/z')
  })

  it('refuses to init when DSN is empty', () => {
    ;(globalThis as Record<string, unknown>).window = {}
    initBrowserSentry({ dsn: '' })
    expect(
      (globalThis as { window: { __sentryInit?: unknown } }).window
        .__sentryInit,
    ).toBeUndefined()
  })
})
