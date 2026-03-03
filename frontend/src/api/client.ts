// API Base URL
const API_BASE_URL = 'http://localhost:8000/api'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function fetchWrapper<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token')

  const extraHeaders = (options.headers ?? {}) as Record<string, string>
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new ApiError('Unauthorized', 401)
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      detail?: string
    }
    throw new ApiError(errorData.detail || response.statusText, response.status)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const apiClient = {
  get: <T,>(endpoint: string) => fetchWrapper<T>(endpoint),

  post: <T,>(endpoint: string, body: unknown) =>
    fetchWrapper<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T,>(endpoint: string, body: unknown) =>
    fetchWrapper<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T,>(endpoint: string) =>
    fetchWrapper<T>(endpoint, {
      method: 'DELETE',
    }),
}