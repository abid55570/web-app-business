/**
 * ai-llm API client smoke.
 */
import { describe, expect, it, vi } from 'vitest'
import { aiApi } from '@/lib/api/ai'


function mockJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('aiApi', () => {
  it('chat() POSTs messages', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockJson({
          id: 'l-1',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-latest',
          message: { role: 'assistant', content: 'hi' },
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 42,
        }),
      )

    await aiApi.chat({
      messages: [{ role: 'user', content: 'hello' }],
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ai/chat')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string).messages[0].content).toBe('hello')
  })

  it('myUsage() GETs /ai/usage/my', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ userId: 'u-1', usedLast24h: 3 }))

    await aiApi.myUsage()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ai/usage/my')
  })

  it('adminUsage() builds filter query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJson({ items: [], total: 0 }))

    await aiApi.adminUsage({ userId: 'u-1', limit: 50 })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/ai/usage?userId=u-1&limit=50')
  })
})
