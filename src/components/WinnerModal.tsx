import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { Participant } from '../lib/storage'
import './WinnerModal.css'

interface WinnerModalProps {
  participant: Participant
  onClose: () => void
}

export default function WinnerModal({ participant, onClose }: WinnerModalProps) {
  const hasConfetti = useRef(false)

  useEffect(() => {
    if (hasConfetti.current) return
    hasConfetti.current = true

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FFD700', '#FF6B35', '#E31C25', '#4A90D9', '#27AE60'],
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FFD700', '#FF6B35', '#E31C25', '#4A90D9', '#27AE60'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B35', '#E31C25', '#4A90D9', '#27AE60'],
    })
  }, [])

  return (
    <div className="winner-modal-overlay" onClick={onClose}>
      <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winner-modal-glow" />
        <div className="winner-modal-content">
          <h2 className="winner-congrats">CHÚC MỪNG!</h2>
          <div className="winner-participant-name">{participant.full_name}</div>
          <div className="winner-cccd-display">{participant.cccd}</div>
          <div className="winner-coins">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="floating-coin" style={{ animationDelay: `${i * 0.2}s` }}>
                🪙
              </span>
            ))}
          </div>
          <button className="btn-winner-close" onClick={onClose}>
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  )
}
