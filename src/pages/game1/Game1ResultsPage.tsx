import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Game1Player } from '../../lib/types'
import './Game1ResultsPage.css'

export default function Game1ResultsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [winners, setWinners] = useState<Game1Player[]>([])

  useEffect(() => {
    if (!sessionId) return
    api.get<Game1Player[]>(`/game1/players?session_id=${sessionId}&is_winner=true`)
      .then(data => { if (data) setWinners(data) })
  }, [sessionId])

  return (
    <div className="results-page">
      <div className="results-bg-effects">
        <div className="results-bg-light results-bg-light-1" />
        <div className="results-bg-light results-bg-light-2" />
      </div>

      <div className="results-content">
        <div className="results-header">
          <button className="btn-back-results" onClick={() => navigate('/game1')}>
            ← Quay lại
          </button>
          <h1 className="results-title">KẾT QUẢ TRÚNG THƯỞNG</h1>
        </div>

        {winners.length === 0 ? (
          <div className="no-winners">
            <span className="no-winners-icon">🎰</span>
            <p>Chưa có ai trúng thưởng</p>
          </div>
        ) : (
          <div className="winners-table-container">
            <div className="winners-count">
              Tổng số người trúng: <strong>{winners.length}</strong>
            </div>
            <table className="winners-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ Tên</th>
                  <th>CCCD</th>
                  <th>SDT</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w, i) => (
                  <tr key={w.id}>
                    <td>{i + 1}</td>
                    <td className="winner-name-cell">{w.full_name}</td>
                    <td>{w.cccd}</td>
                    <td>{w.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
