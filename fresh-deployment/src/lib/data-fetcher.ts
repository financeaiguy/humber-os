import { cache } from 'react'

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface FetchResult<T> {
  data: T | null
  error: Error | null
  status: FetchStatus
  retry: () => Promise<void>
}

interface FetchOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  timeout?: number
  onRetry?: (attempt: number, error: Error) => void
}

class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    onRetry,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new FetchError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response.statusText
        )
      }

      return response
    } catch (error) {
      lastError = error as Error

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new FetchError('Request timeout', 408, 'Request Timeout')
      }

      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt) // Exponential backoff
        onRetry?.(attempt + 1, lastError)
        await wait(delay)
      }
    }
  }

  throw lastError || new FetchError('Failed to fetch after retries')
}

// Cached fetch for server components
export const cachedFetch = cache(async (url: string, options?: FetchOptions) => {
  return fetchWithRetry(url, options)
})

// Data fetching hook for client components
export function createDataFetcher<T>(
  fetcher: () => Promise<T>,
  options?: {
    revalidate?: number
    fallback?: T
  }
) {
  let data: T | undefined = options?.fallback
  let error: Error | null = null
  let promise: Promise<void> | null = null

  const refresh = async () => {
    try {
      data = await fetcher()
      error = null
    } catch (e) {
      error = e as Error
      throw e
    }
  }

  // Initial fetch
  promise = refresh()

  return {
    read() {
      if (error) throw error
      if (data !== undefined) return data
      throw promise
    },
    refresh,
    preload() {
      refresh()
    }
  }
}

// API client with built-in error handling
export class ApiClient {
  private baseUrl: string
  private defaultOptions: FetchOptions

  constructor(baseUrl: string = '', defaultOptions: FetchOptions = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = defaultOptions
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetchWithRetry(url, {
      ...this.defaultOptions,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultOptions.headers,
        ...options.headers
      }
    })

    const data = await response.json()
    return data as T
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  async put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }
}

// Default API client instance
export const apiClient = new ApiClient('/api', {
  retries: 3,
  retryDelay: 1000,
  timeout: 30000
})