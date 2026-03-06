import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../../lib/api'
import { useGame1Players } from '../../lib/hooks/useGame1Players'
import type { Game1Player } from '../../lib/types'
import NameRoller from '../../components/NameRoller'
import WinnerModal from '../../components/WinnerModal'
import type { Participant } from '../../lib/storage'
import './Game1Page.css'

const SESSION_KEY = 'game1_session_id'

export default function Game1Page() {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [winnerPlayer, setWinnerPlayer] = useState<Game1Player | null>(null)
  const [showQR, setShowQR] = useState(false)

  const { available, winners, loading, count } = useGame1Players(sessionId)

  useEffect(() => {
    async function initSession() {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        const data = await api.get(`/game-sessions/${saved}?status=active`).catch(() => null)
        if (data) { setSessionId(saved); return }
      }
      const data = await api.post('/game-sessions', { game_type: 1, title: 'Quay Ten', status: 'active' })
      if (data) {
        localStorage.setItem(SESSION_KEY, data.id)
        setSessionId(data.id)
      }
    }
    initSession()
  }, [])

  const registerUrl = sessionId ? `${window.location.origin}/game1/play/${sessionId}` : ''

  const availableAsParticipants: Participant[] = available.map(p => ({
    id: p.id, full_name: p.full_name, cccd: p.cccd, phone: p.phone,
  }))

  function handleSpinStart() {
    if (spinning || available.length === 0) return
    const idx = Math.floor(Math.random() * available.length)
    setTargetIndex(idx)
    setSpinning(true)
  }

  async function handleRollEnd(participant: Participant) {
    setSpinning(false)
    const player = available.find(p => p.id === participant.id)
    if (player) {
      setWinnerPlayer(player)
      await api.patch(`/game1/players/${player.id}`, { is_winner: true })
    }
  }

  async function handleNewSession() {
    if (!confirm('Tạo phiên mới? Danh sách người chơi sẽ bị xóa.')) return
    const data = await api.post('/game-sessions', { game_type: 1, title: 'Quay Ten', status: 'active' })
    if (data) {
      localStorage.setItem(SESSION_KEY, data.id)
      setSessionId(data.id)
    }
  }

  if (!sessionId || loading) {
    return <div className="game-page"><p style={{ textAlign: 'center', marginTop: '3rem', color: 'rgba(255,255,255,0.5)' }}>Đang tải...</p></div>
  }

  return (
    <div className="game-page">
      <div className="game-bg-effects" />

      <div className="game-header">
        <div className="header-actions">
          <button className="btn-header" onClick={() => navigate('/')}>← Trang chủ</button>
          <button className="btn-header btn-qr" onClick={() => setShowQR(!showQR)}>
            {showQR ? 'Ẩn QR' : 'Hiện QR'}
          </button>
          <button className="btn-header">Người Chơi ({count})</button>
          <button className="btn-header btn-results" onClick={() => navigate('/game1/results/' + sessionId)}>
            Kết Quả ({winners.length})
          </button>
          <button className="btn-header btn-danger" onClick={handleNewSession}>Phiên Mới</button>
        </div>
      </div>

      {showQR && (
        <div className="game1-qr-section">
          <div className="game1-qr-card">
            <p className="game1-qr-label">Scan để tham gia</p>
            <div className="game1-qr-code">
              <QRCodeSVG value={registerUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
            <p className="game1-qr-url">{registerUrl}</p>
            <p className="game1-qr-count">{count} người đã tham gia</p>
          </div>
        </div>
      )}

      <div className="game-content">
        <div className="roller-section">
          <NameRoller
            participants={availableAsParticipants}
            spinning={spinning}
            targetIndex={targetIndex}
            onSpinEnd={handleRollEnd}
            onSpinStart={handleSpinStart}
          />
          <p className="available-count">
            Người chơi còn lại: <strong>{available.length}</strong> / {count}
          </p>
        </div>
      </div>

      {winnerPlayer && (
        <WinnerModal
          participant={{ id: winnerPlayer.id, full_name: winnerPlayer.full_name, cccd: winnerPlayer.cccd, phone: winnerPlayer.phone }}
          onClose={() => setWinnerPlayer(null)}
        />
      )}
    </div>
  )
}
