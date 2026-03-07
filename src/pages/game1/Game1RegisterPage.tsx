import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { getGlobalPlayer, saveGlobalPlayer, crossRegisterAllGames } from '../../lib/globalPlayer'
import './Game1RegisterPage.css'

export default function Game1RegisterPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [fullName, setFullName] = useState('')
  const [cccd, setCccd] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [autoRegistering, setAutoRegistering] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    // Already registered for this session?
    const saved = localStorage.getItem(`game1_player_${sessionId}`)
    if (saved) {
      try {
        const p = JSON.parse(saved)
        // Save global player if not exists yet, and cross-register
        if (!getGlobalPlayer()) {
          const globalData = {
            full_name: p.full_name || '',
            phone: p.phone || '',
            company: '',
            cccd: p.cccd || '',
          }
          saveGlobalPlayer(globalData)
          crossRegisterAllGames(globalData, 1, sessionId!)
        } else {
          crossRegisterAllGames(getGlobalPlayer()!, 1, sessionId!)
        }
        setDone(true)
        setPlayerName(p.full_name)
        setAutoRegistering(false)
        return
      } catch { /* ignore */ }
    }

    // Global player exists? Auto-register
    const global = getGlobalPlayer()
    if (global) {
      doAutoRegister(global)
    } else {
      setAutoRegistering(false)
    }
  }, [sessionId])

  async function doAutoRegister(global: ReturnType<typeof getGlobalPlayer>) {
    if (!global || !sessionId) { setAutoRegistering(false); return }
    try {
      const data = await api.post('/game1/players', {
        session_id: sessionId,
        full_name: global.full_name,
        cccd: global.cccd || '',
        phone: global.phone || '',
      })
      if (data) {
        localStorage.setItem(`game1_player_${sessionId}`, JSON.stringify(data))
        setDone(true)
        setPlayerName(data.full_name)
        // Cross-register for all other active game sessions
        crossRegisterAllGames(global, 1, sessionId!)
      }
    } catch {
      // Failed → show form pre-filled
      setFullName(global.full_name)
      setPhone(global.phone)
      setCccd(global.cccd)
      setCompany(global.company)
    }
    setAutoRegistering(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !sessionId) return

    setSubmitting(true)
    try {
      const data = await api.post('/game1/players', {
        session_id: sessionId,
        full_name: fullName.trim(),
        cccd: cccd.trim(),
        phone: phone.trim(),
      })

      if (data) {
        localStorage.setItem(`game1_player_${sessionId}`, JSON.stringify(data))
        const globalData = {
          full_name: fullName.trim(),
          phone: phone.trim(),
          company: company.trim(),
          cccd: cccd.trim(),
        }
        saveGlobalPlayer(globalData)
        setDone(true)
        setPlayerName(data.full_name)
        // Cross-register for all other active game sessions (fire & forget)
        crossRegisterAllGames(globalData, 1, sessionId!)
      }
    } catch (err: any) {
      alert('Lỗi đăng ký: ' + err.message)
    }
    setSubmitting(false)
  }

  if (autoRegistering) {
    return (
      <div className="g1reg-page">
        <div className="g1reg-card">
          <p style={{ textAlign: 'center', color: '#fff' }}>Đang đăng ký...</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="g1reg-page">
        <div className="g1reg-card">
          <div className="g1reg-success-icon">✅</div>
          <h2 className="g1reg-success-title">ĐĂNG KÝ THÀNH CÔNG!</h2>
          <p className="g1reg-success-name">{playerName}</p>
          <p className="g1reg-success-msg">Bạn đã được thêm vào danh sách quay thưởng. Vui lòng chờ MC quay số!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="g1reg-page">
      <div className="g1reg-card">
        <h1 className="g1reg-title">ĐĂNG KÝ THAM GIA</h1>
        <p className="g1reg-subtitle">Nhập thông tin để tham gia quay thưởng</p>

        <form onSubmit={handleSubmit} className="g1reg-form">
          <div className="g1reg-field">
            <label>Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              autoFocus
            />
          </div>

          <div className="g1reg-field">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0901234567"
            />
          </div>

          <div className="g1reg-field">
            <label>Sàn bất động sản</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Nhập tên sàn BDS..."
            />
          </div>

          <div className="g1reg-field">
            <label>CCCD</label>
            <input
              type="text"
              value={cccd}
              onChange={e => setCccd(e.target.value)}
              placeholder="0123456789"
            />
          </div>

          <button type="submit" className="g1reg-btn" disabled={submitting || !fullName.trim()}>
            {submitting ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>
      </div>
    </div>
  )
}
