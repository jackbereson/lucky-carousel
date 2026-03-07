const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const AUTH_TOKEN_KEY = 'auth_token'

async function request<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    if (
      window.location.pathname.match(
        /^\/(admin|game1$|game2\/(admin|host)|game3$)/,
      )
    ) {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'API Error')
  }
  return res.json()
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, data?: any) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T = any>(path: string, data?: any) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: <T = any>(path: string, data?: any) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
}
