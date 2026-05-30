import { apiFetch } from './client'

export type AIProvider = 'anthropic' | 'openai'

export type AIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatInput = {
  provider?: AIProvider
  model?: string
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
}

export type ChatResponse = {
  id: string
  provider: AIProvider
  model: string
  message: AIMessage
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export type UsageRow = {
  id: string
  userId: string
  provider: AIProvider
  model: string
  inputTokens: number
  outputTokens: number
  costCents: number
  latencyMs: number
  createdAt: string
}

export type UsageListResponse = {
  items: UsageRow[]
  total: number
}

const PUBLIC = '/api/ai'
const ADMIN = '/api/admin/ai'

export const aiApi = {
  chat: (body: ChatInput) =>
    apiFetch<ChatResponse>(`${PUBLIC}/chat`, { method: 'POST', body }),

  myUsage: () =>
    apiFetch<{ userId: string; usedLast24h: number }>(`${PUBLIC}/usage/my`),

  adminUsage: (opts: { userId?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams()
    if (opts.userId) qs.set('userId', opts.userId)
    if (opts.limit != null) qs.set('limit', String(opts.limit))
    const url = qs.toString() ? `${ADMIN}/usage?${qs}` : `${ADMIN}/usage`
    return apiFetch<UsageListResponse>(url)
  },
}
