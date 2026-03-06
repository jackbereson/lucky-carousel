import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import type { GameSession } from '../../lib/types'
import './AdminHub.css'

export default function AdminHub() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.get<GameSession[]>('/game-sessions?game_type=2')
      .then(data => { if (data) setSessions(data) })
  }, [])

  async function handleCreate() {
    if (!title.trim()) return
    setCreating(true)

    try {
      const session = await api.post('/game-sessions', {
        game_type: 2,
        title: title.trim(),
        status: 'active',
      })

      if (session) {
        navigate(`/game2/admin/${session.id}`)
      }
    } catch (err: any) {
      alert('Loi tao session: ' + err.message)
    }
    setCreating(false)
  }

  async function handleReset(sessionId: string) {
    if (!confirm('Ban co chac muon RESET session nay?\n\nTat ca nguoi choi va ket qua se bi xoa!')) return
    try {
      const result = await api.post(`/game2/reset/${sessionId}`)
      alert(`Da reset! Xoa ${result.deleted_players} nguoi choi, ${result.deleted_answers} cau tra loi.`)
    } catch (err: any) {
      alert('Loi reset: ' + err.message)
    }
  }

  return (
    <div className="admin-hub">
      <div className="admin-hub-content">
        <div className="admin-hub-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Trang chu
          </button>
          <h1 className="admin-hub-title">QUAN LY GAME CAU HOI</h1>
        </div>

        <div className="create-session-card">
          <h2>Tao Session Moi</h2>
          <div className="create-form">
            <input
              type="text"
              placeholder="Ten session (VD: Team Building Q1 2026)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-session-title"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              className="btn-create"
              onClick={handleCreate}
              disabled={creating || !title.trim()}
            >
              {creating ? 'Dang tao...' : 'Tao Moi'}
            </button>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="sessions-list">
            <h2>Cac Session Da Tao</h2>
            <div className="sessions-grid">
              {sessions.map(s => (
                <div key={s.id} className="session-card">
                  <div className="session-info">
                    <h3>{s.title || 'Untitled'}</h3>
                    <span className={`session-status status-${s.status}`}>{s.status}</span>
                    <p className="session-date">
                      {new Date(s.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="session-actions">
                    <button
                      className="btn-session-action"
                      onClick={() => navigate(`/game2/admin/${s.id}`)}
                    >
                      Admin
                    </button>
                    <button
                      className="btn-session-action btn-host"
                      onClick={() => navigate(`/game2/host/${s.id}`)}
                    >
                      Chu Toa
                    </button>
                    <button
                      className="btn-session-action btn-projector"
                      onClick={() => navigate(`/game2/projector/${s.id}`)}
                    >
                      Projector
                    </button>
                    <button
                      className="btn-session-action btn-reset"
                      onClick={() => handleReset(s.id)}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
