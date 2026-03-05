import { useEffect, useRef, useState } from 'react'
import type { Participant } from '../lib/storage'
import './NameRoller.css'

interface NameRollerProps {
  participants: Participant[]
  spinning: boolean
  targetIndex: number | null
  onSpinEnd: (participant: Participant) => void
  onSpinStart: () => void
}

const ANGLE_PER_ITEM = 20
const RADIUS = 200
const VISIBLE_COUNT = 11
const HALF = Math.floor(VISIBLE_COUNT / 2)
const DURATION = 6000
const MIN_CYCLES = 8

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function NameRoller({ participants, spinning, targetIndex, onSpinEnd, onSpinStart }: NameRollerProps) {
  const [currentPos, setCurrentPos] = useState(0)
  const animRef = useRef<number | null>(null)
  const posRef = useRef(0)
  const hasCalledEnd = useRef(false)

  useEffect(() => {
    if (!spinning || targetIndex === null || participants.length === 0) return

    hasCalledEnd.current = false
    const n = participants.length
    const startPos = posRef.current
    const cycles = MIN_CYCLES * n
    const targetPos = startPos + cycles + ((targetIndex - (Math.round(startPos) % n) + n) % n)
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOutQuart(progress)
      const pos = startPos + (targetPos - startPos) * eased
      posRef.current = pos
      setCurrentPos(pos)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else if (!hasCalledEnd.current) {
        hasCalledEnd.current = true
        posRef.current = targetPos
        setCurrentPos(targetPos)
        onSpinEnd(participants[targetIndex!])
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [spinning, targetIndex])

  function getVisibleItems() {
    if (participants.length === 0) return []
    const n = participants.length
    const items = []
    const center = Math.floor(currentPos + 0.5)

    for (let i = center - HALF; i <= center + HALF; i++) {
      const wrappedIdx = ((i % n) + n) % n
      const offsetFromCenter = i - currentPos
      const angle = offsetFromCenter * ANGLE_PER_ITEM

      if (Math.abs(angle) > 90) continue

      items.push({
        participant: participants[wrappedIdx],
        angle,
        offsetFromCenter,
        key: i,
      })
    }
    return items
  }

  const items = getVisibleItems()

  return (
    <div className="name-roller-wrapper">
      <div className="name-roller-container">
        <div className="roller-highlight-bar" />
        <div className="roller-perspective">
          <div className="roller-cylinder">
            {participants.length === 0 ? (
              <div className="roller-empty">
                <p>Chưa có người chơi</p>
                <p>Hãy import CSV trước!</p>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.key}
                  className="roller-item"
                  style={{
                    transform: `rotateX(${-item.angle}deg) translateZ(${RADIUS}px)`,
                    opacity: Math.max(0.1, 1 - Math.abs(item.offsetFromCenter) * 0.22),
                  }}
                >
                  <div className="roller-item-name">{item.participant.full_name}</div>
                  <div className="roller-item-cccd">{item.participant.cccd}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        className="btn-roll"
        onClick={onSpinStart}
        disabled={spinning || participants.length === 0}
      >
        {spinning ? 'ĐANG QUAY...' : 'QUAY NGAY'}
      </button>
    </div>
  )
}
