import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWinners, clearWinners, type Winner } from '../lib/storage'
import './ResultsPage.css'

export default function ResultsPage() {
  const navigate = useNavigate()
  const [winners, setWinners] = useState<Winner[]>([])

  useEffect(() => {
    setWinners(getWinners())
  }, [])

  function handleClearWinners() {
    if (confirm('Bạn có chắc muốn xóa tất cả kết quả?')) {
      clearWinners()
      setWinners([])
    }
  }

  return (
    <div className="results-page">
      <div className="results-bg-effects">
        <div className="results-bg-light results-bg-light-1" />
        <div className="results-bg-light results-bg-light-2" />
      </div>

      <div className="results-content">
        <div className="results-header">
          <button className="btn-back-results" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
          <h1 className="results-title">KẾT QUẢ TRÚNG THƯỞNG</h1>
          {winners.length > 0 && (
            <button className="btn-clear-winners" onClick={handleClearWinners}>
              🗑 Xóa kết quả
            </button>
          )}
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
                  <th>SĐT</th>
                  <th>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w, i) => (
                  <tr key={w.id}>
                    <td>{i + 1}</td>
                    <td className="winner-name-cell">{w.participant.full_name}</td>
                    <td>{w.participant.cccd}</td>
                    <td>{w.participant.phone || '-'}</td>
                    <td className="winner-time">
                      {new Date(w.created_at).toLocaleString('vi-VN')}
                    </td>
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
