type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

type ErrorBody = {
  code?: string
  message?: string
  detail?: { code?: string; message?: string } | string
}

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  })
  if (response.status === 204) return undefined as T
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    /* non-JSON ok if response.ok */
  }
  if (!response.ok) {
    const errorBody = data as ErrorBody | null
    const detail = typeof errorBody?.detail === 'object' ? errorBody.detail : null
    const code = errorBody?.code ?? detail?.code ?? 'UNKNOWN_ERROR'
    const message =
      errorBody?.message ?? detail?.message ?? `Request failed with status ${response.status}`
    throw new ApiClientError(response.status, code, message)
  }
  return data as T
}
