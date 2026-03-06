import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPrizeResults, clearPrizeResults, type PrizeResult } from '../../lib/storage'
import './Game3ResultsPage.css'

export default function Game3ResultsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<PrizeResult[]>([])

  useEffect(() => {
    setResults(getPrizeResults())
  }, [])

  function handleClear() {
    if (confirm('Bạn có chắc muốn xóa tất cả lịch sử?')) {
      clearPrizeResults()
      setResults([])
    }
  }

  return (
    <div className="game3-results-page">
      <div className="game3-results-bg-effects">
        <div className="game3-results-bg-light game3-results-bg-light-1" />
        <div className="game3-results-bg-light game3-results-bg-light-2" />
      </div>

      <div className="game3-results-content">
        <div className="game3-results-header">
          <button className="game3-btn-back-results" onClick={() => navigate('/game3')}>
            ← Quay lại
          </button>
          <h1 className="game3-results-title">LỊCH SỬ QUAY THƯỞNG</h1>
          {results.length > 0 && (
            <button className="game3-btn-clear-winners" onClick={handleClear}>
              Xóa lịch sử
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="game3-no-winners">
            <span className="game3-no-winners-icon">🎡</span>
            <p>Chưa có lượt quay nào</p>
          </div>
        ) : (
          <div className="game3-winners-table-container">
            <div className="game3-winners-count">
              Tổng số lượt quay: <strong>{results.length}</strong>
            </div>
            <table className="game3-winners-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Giải Thưởng</th>
                  <th>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="game3-prize-badge" style={{
                        background: `${r.prize.color}22`,
                        borderColor: `${r.prize.color}66`,
                        color: r.prize.color,
                      }}>
                        {r.prize.name}
                      </span>
                    </td>
                    <td className="game3-winner-time">
                      {new Date(r.created_at).toLocaleString('vi-VN')}
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
