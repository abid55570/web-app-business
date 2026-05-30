/**
 * telemetry-plausible API client + script-tag helper smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  plausibleApi,
  plausibleScriptTag,
} from '@/lib/api/telemetry-plausible'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}


describe('plausibleApi', () => {
  it('health() GETs /telemetry/plausible/health', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({
          enabled: true,
          host: 'https://plausible.io',
          domain: 'acme.com',
        }),
      )

    await plausibleApi.health()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/plausible/health')
  })

  it('goal() POSTs name + url', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({ name: 'Signup', outcome: 'delivered' }),
      )

    await plausibleApi.goal({
      name: 'Signup',
      url: 'https://acme.com/welcome',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/telemetry/plausible/goal')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).name).toBe('Signup')
  })
})


describe('plausibleScriptTag', () => {
  it('emits the default-hosted script tag', () => {
    const tag = plausibleScriptTag({ domain: 'acme.com' })
    expect(tag).toBe(
      '<script defer data-domain="acme.com" src="https://plausible.io/js/script.js"></script>',
    )
  })

  it('honors a custom self-hosted host', () => {
    const tag = plausibleScriptTag({
      domain: 'acme.com',
      host: 'https://analytics.acme.com',
    })
    expect(tag).toContain('src="https://analytics.acme.com/js/script.js"')
  })

  it('escapes HTML in the domain so injection is impossible', () => {
    const tag = plausibleScriptTag({
      domain: 'evil.com" onerror="alert(1)',
    })
    expect(tag).not.toContain('onerror')
    expect(tag).toContain('&quot;')
  })
})
