import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import './Game2RegisterPage.css'

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
]

export default function Game2RegisterPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true)

  // Check if player already registered
  useEffect(() => {
    if (!sessionId) return
    const existingId = localStorage.getItem(`game2_player_${sessionId}`)
    if (existingId) {
      navigate(`/game2/play/${sessionId}/q`, { replace: true })
    } else {
      setCheckingExisting(false)
    }
  }, [sessionId, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionId || !name.trim()) return

    setLoading(true)
    setError('')

    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    try {
      const data = await api.post('/game2/players', {
        session_id: sessionId,
        name: name.trim(),
        phone: phone.trim(),
        avatar_color: avatarColor,
      })

      if (data) {
        localStorage.setItem(`game2_player_${sessionId}`, data.id)
        navigate(`/game2/play/${sessionId}/q`, { replace: true })
      }
    } catch {
      setError('Khong the dang ky. Vui long thu lai.')
    }

    setLoading(false)
  }

  if (checkingExisting) return null

  return (
    <div className="g2-register">
      <div className="g2-register-bg">
        <div className="g2-register-bg-glow g2-register-bg-glow-1" />
        <div className="g2-register-bg-glow g2-register-bg-glow-2" />
      </div>

      <div className="g2-register-card">
        <div className="g2-register-icon">&#9889;</div>
        <h1 className="g2-register-title">DANG KY THAM GIA</h1>

        <form className="g2-register-form" onSubmit={handleSubmit}>
          <div className="g2-register-field">
            <label className="g2-register-label">Ten cua ban *</label>
            <input
              className="g2-register-input"
              type="text"
              placeholder="Nhap ten..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="g2-register-field">
            <label className="g2-register-label">So dien thoai (tuy chon)</label>
            <input
              className="g2-register-input"
              type="tel"
              placeholder="Nhap so dien thoai..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          {error && <div className="g2-register-error">{error}</div>}

          <button
            className="g2-register-submit"
            type="submit"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Dang xu ly...' : 'THAM GIA'}
          </button>
        </form>
      </div>
    </div>
  )
}
