const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
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
