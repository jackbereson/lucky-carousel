import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { getGlobalPlayer, saveGlobalPlayer, crossRegisterAllGames } from '../../lib/globalPlayer'
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
  const [company, setCompany] = useState('')
  const [cccd, setCccd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    // Already registered for this session?
    const existingId = localStorage.getItem(`game2_player_${sessionId}`)
    if (existingId) {
      api.get(`/game2/players/${existingId}`)
        .then((data: any) => {
          if (data) {
            // Save global player if not exists yet, and cross-register
            if (!getGlobalPlayer()) {
              const globalData = {
                full_name: data.name || '',
                phone: data.phone || '',
                company: data.company || '',
                cccd: '',
              }
              saveGlobalPlayer(globalData)
              crossRegisterAllGames(globalData, 2, sessionId!)
            } else {
              crossRegisterAllGames(getGlobalPlayer()!, 2, sessionId!)
            }
            navigate(`/game2/play/${sessionId}/q`, { replace: true })
          } else {
            localStorage.removeItem(`game2_player_${sessionId}`)
            tryAutoRegister()
          }
        })
        .catch(() => {
          localStorage.removeItem(`game2_player_${sessionId}`)
          tryAutoRegister()
        })
    } else {
      tryAutoRegister()
    }
  }, [sessionId, navigate])

  async function tryAutoRegister() {
    const global = getGlobalPlayer()
    if (global) {
      await doAutoRegister(global)
    } else {
      setCheckingExisting(false)
    }
  }

  async function doAutoRegister(global: NonNullable<ReturnType<typeof getGlobalPlayer>>) {
    if (!sessionId) { setCheckingExisting(false); return }
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    try {
      const data = await api.post('/game2/players', {
        session_id: sessionId,
        name: global.full_name,
        phone: global.phone || '',
        company: global.company || '',
        avatar_color: avatarColor,
      })
      if (data) {
        localStorage.setItem(`game2_player_${sessionId}`, data.id)
        // Cross-register for all other active game sessions
        crossRegisterAllGames(global, 2, sessionId!)
        navigate(`/game2/play/${sessionId}/q`, { replace: true })
        return
      }
    } catch {
      // Failed → show form pre-filled
      setName(global.full_name)
      setPhone(global.phone)
      setCompany(global.company)
      setCccd(global.cccd)
    }
    setCheckingExisting(false)
  }

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
        company: company.trim(),
        avatar_color: avatarColor,
      })

      if (data) {
        localStorage.setItem(`game2_player_${sessionId}`, data.id)
        const globalData = {
          full_name: name.trim(),
          phone: phone.trim(),
          company: company.trim(),
          cccd: cccd.trim(),
        }
        saveGlobalPlayer(globalData)
        // Cross-register for all other active game sessions (fire & forget)
        crossRegisterAllGames(globalData, 2, sessionId!)
        navigate(`/game2/play/${sessionId}/q`, { replace: true })
      }
    } catch {
      setError('Không thể đăng ký. Vui lòng thử lại.')
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
        <h1 className="g2-register-title">ĐĂNG KÝ THAM GIA</h1>

        <form className="g2-register-form" onSubmit={handleSubmit}>
          <div className="g2-register-field">
            <label className="g2-register-label">Tên của bạn *</label>
            <input
              className="g2-register-input"
              type="text"
              placeholder="Nhập tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="g2-register-field">
            <label className="g2-register-label">Số điện thoại *</label>
            <input
              className="g2-register-input"
              type="tel"
              placeholder="Nhập số điện thoại..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className="g2-register-field">
            <label className="g2-register-label">Sàn bất động sản *</label>
            <input
              className="g2-register-input"
              type="text"
              placeholder="Nhập tên sàn BDS..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="g2-register-field">
            <label className="g2-register-label">CCCD</label>
            <input
              className="g2-register-input"
              type="text"
              placeholder="Nhập số CCCD..."
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
            />
          </div>

          {error && <div className="g2-register-error">{error}</div>}

          <button
            className="g2-register-submit"
            type="submit"
            disabled={loading || !name.trim() || !company.trim() || !phone.trim()}
          >
            {loading ? 'Đang xử lý...' : 'THAM GIA'}
          </button>
        </form>
      </div>
    </div>
  )
}
