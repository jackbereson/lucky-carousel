import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import './Game1RegisterPage.css'

export default function Game1RegisterPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [fullName, setFullName] = useState('')
  const [cccd, setCccd] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    if (!sessionId) return
    const saved = localStorage.getItem(`game1_player_${sessionId}`)
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setDone(true)
        setPlayerName(p.full_name)
      } catch { /* ignore */ }
    }
  }, [sessionId])

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
        setDone(true)
        setPlayerName(data.full_name)
      }
    } catch (err: any) {
      alert('Loi dang ky: ' + err.message)
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="g1reg-page">
        <div className="g1reg-card">
          <div className="g1reg-success-icon">✅</div>
          <h2 className="g1reg-success-title">DANG KY THANH CONG!</h2>
          <p className="g1reg-success-name">{playerName}</p>
          <p className="g1reg-success-msg">Ban da duoc them vao danh sach quay thuong. Vui long cho MC quay so!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="g1reg-page">
      <div className="g1reg-card">
        <h1 className="g1reg-title">DANG KY THAM GIA</h1>
        <p className="g1reg-subtitle">Nhap thong tin de tham gia quay thuong</p>

        <form onSubmit={handleSubmit} className="g1reg-form">
          <div className="g1reg-field">
            <label>Ho va ten *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nguyen Van A"
              required
              autoFocus
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

          <div className="g1reg-field">
            <label>So dien thoai</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0901234567"
            />
          </div>

          <button type="submit" className="g1reg-btn" disabled={submitting || !fullName.trim()}>
            {submitting ? 'Dang dang ky...' : 'DANG KY'}
          </button>
        </form>
      </div>
    </div>
  )
}
