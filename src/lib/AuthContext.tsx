import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { AUTH_TOKEN_KEY } from './api'

interface AuthUser {
  id: string
  username: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(AUTH_TOKEN_KEY),
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyToken() {
      const stored = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!stored) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setToken(stored)
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          setToken(null)
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
      }
      setLoading(false)
    }
    verifyToken()
  }, [])

  async function login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(err.message || 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
