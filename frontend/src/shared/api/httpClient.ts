import { tokenStorage } from '../auth/tokenStorage'
import type { ApiResult, HttpMethod, ProblemDetails } from '../types/api'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5134'

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

function toProblemDetails(status: number, fallback: string, payload: unknown): ProblemDetails {
  if (payload && typeof payload === 'object') {
    return {
      status,
      title: fallback,
      ...(payload as Record<string, unknown>),
    }
  }

  return {
    status,
    title: fallback,
  }
}

export async function requestAsync<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...options.headers,
  }

  const token = tokenStorage.getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json() : undefined

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: toProblemDetails(response.status, 'Request failed', payload),
      }
    }

    return {
      ok: true,
      status: response.status,
      data: (payload as T) ?? ({} as T),
    }
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        title: 'Network error',
        detail: 'The request could not be completed. Check your connection and try again.',
      },
    }
  }
}

export const httpClient = {
  getAsync<T>(path: string, signal?: AbortSignal): Promise<ApiResult<T>> {
    return requestAsync<T>(path, { method: 'GET', signal })
  },

  postAsync<T>(path: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
    return requestAsync<T>(path, { method: 'POST', body, signal })
  },

  putAsync<T>(path: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
    return requestAsync<T>(path, { method: 'PUT', body, signal })
  },

  deleteAsync<T>(path: string, signal?: AbortSignal): Promise<ApiResult<T>> {
    return requestAsync<T>(path, { method: 'DELETE', signal })
  },
}
