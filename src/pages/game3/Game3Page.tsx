import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPrizes, addPrizeResult, type Prize } from '../../lib/storage'
import SpinningWheel from '../../components/game3/SpinningWheel'
import PrizeEditorModal from '../../components/game3/PrizeEditorModal'
import confetti from 'canvas-confetti'
import './Game3Page.css'

export default function Game3Page() {
  const navigate = useNavigate()

  const [prizes, setPrizes] = useState<Prize[]>([])
  const [spinning, setSpinning] = useState(false)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const loadPrizes = useCallback(() => {
    setPrizes(getPrizes())
  }, [])

  useEffect(() => {
    loadPrizes()
  }, [loadPrizes])

  function handleSpinStart() {
    if (spinning || prizes.length === 0) return
    const idx = Math.floor(Math.random() * prizes.length)
    setTargetIndex(idx)
    setSpinning(true)
    setWonPrize(null)
  }

  function handleSpinEnd(prize: Prize) {
    setSpinning(false)
    setWonPrize(prize)
    addPrizeResult(prize)

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B35', '#E31C25', '#4A90D9', '#27AE60'],
    })
  }

  return (
    <div className="game3-page">
      <div className="game3-bg-effects" />

      <div className="game3-header">
        <div className="game3-header-actions">
          <button className="game3-btn-header" onClick={() => navigate('/')}>
            ← Trang chu
          </button>
          <button className="game3-btn-header" onClick={() => setShowEditor(true)}>
            Thiet Lap Giai ({prizes.length})
          </button>
          <button className="game3-btn-header game3-btn-results" onClick={() => navigate('/game3/results')}>
            Lich Su
          </button>
        </div>
      </div>

      <div className="game3-content">
        <div className="game3-wheel-section">
          <SpinningWheel
            prizes={prizes}
            spinning={spinning}
            targetIndex={targetIndex}
            onSpinEnd={handleSpinEnd}
            onSpinStart={handleSpinStart}
          />
        </div>
      </div>

      {wonPrize && (
        <div className="prize-result-overlay" onClick={() => setWonPrize(null)}>
          <div className="prize-result-modal" onClick={e => e.stopPropagation()}>
            <div className="prize-result-glow" />
            <div className="prize-result-content">
              <h2 className="prize-result-title">CHUC MUNG!</h2>
              <div className="prize-result-name" style={{ color: wonPrize.color }}>
                {wonPrize.name}
              </div>
              <div className="prize-result-coins">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="prize-floating-coin" style={{ animationDelay: `${i * 0.2}s` }}>
                    🎁
                  </span>
                ))}
              </div>
              <button className="btn-prize-close" onClick={() => setWonPrize(null)}>
                DONG
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditor && (
        <PrizeEditorModal
          prizes={prizes}
          onClose={() => setShowEditor(false)}
          onSaved={loadPrizes}
        />
      )}
    </div>
  )
}
