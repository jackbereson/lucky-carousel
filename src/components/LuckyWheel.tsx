import { useRef, useState, useEffect, useCallback } from 'react'
import type { Prize } from '../lib/supabase'
import './LuckyWheel.css'

interface LuckyWheelProps {
  prizes: Prize[]
  onSpinEnd: (prize: Prize) => void
  spinning: boolean
  onSpinStart: () => void
  targetPrizeIndex: number | null
}

export default function LuckyWheel({ prizes, onSpinEnd, spinning, onSpinStart, targetPrizeIndex }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const animRef = useRef<number>(0)
  const currentRotationRef = useRef(0)

  const WHEEL_SIZE = 460
  const CENTER = WHEEL_SIZE / 2
  const RADIUS = 200

  const COLORS = [
    '#FF6B35', '#E31C25', '#4A90D9', '#9B59B6',
    '#E67E22', '#27AE60', '#E74C3C', '#2980B9'
  ]

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D) => {
    const numPrizes = prizes.length
    if (numPrizes === 0) return
    const sliceAngle = (2 * Math.PI) / numPrizes

    // Draw slices
    for (let i = 0; i < numPrizes; i++) {
      const startAngle = i * sliceAngle - Math.PI / 2
      const endAngle = startAngle + sliceAngle

      // Slice fill
      ctx.beginPath()
      ctx.moveTo(CENTER, CENTER)
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()

      // Slice border
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Text - draw along the radius
      ctx.save()
      ctx.translate(CENTER, CENTER)
      const midAngle = startAngle + sliceAngle / 2

      // Normalize angle to determine if text would be upside down
      const normalizedAngle = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const isFlipped = normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2

      ctx.rotate(midAngle)

      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 4
      ctx.textBaseline = 'middle'

      if (isFlipped) {
        // Flip text 180deg so it reads from edge toward center
        ctx.rotate(Math.PI)
        ctx.textAlign = 'right'

        // Prize name
        ctx.font = 'bold 16px "Baloo 2", sans-serif'
        ctx.fillText(prizes[i].name, -RADIUS * 0.35, 2)

        // Icon
        ctx.font = '24px sans-serif'
        ctx.fillText(prizes[i].icon, -RADIUS * 0.68, 0)
      } else {
        ctx.textAlign = 'left'

        // Prize name
        ctx.font = 'bold 16px "Baloo 2", sans-serif'
        ctx.fillText(prizes[i].name, RADIUS * 0.35, -2)

        // Icon
        ctx.font = '24px sans-serif'
        ctx.fillText(prizes[i].icon, RADIUS * 0.68, 0)
      }

      ctx.restore()
    }

    // Outer ring glow
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, RADIUS + 4, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'
    ctx.lineWidth = 8
    ctx.stroke()

    // Bulbs around edge
    const numBulbs = 24
    for (let i = 0; i < numBulbs; i++) {
      const angle = (i / numBulbs) * 2 * Math.PI
      const bx = CENTER + (RADIUS + 12) * Math.cos(angle)
      const by = CENTER + (RADIUS + 12) * Math.sin(angle)
      ctx.beginPath()
      ctx.arc(bx, by, 5, 0, 2 * Math.PI)
      ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Center circle
    const gradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 30)
    gradient.addColorStop(0, '#FF4444')
    gradient.addColorStop(1, '#CC0000')
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, 30, 0, 2 * Math.PI)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.stroke()
  }, [prizes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE)
    drawWheel(ctx)
  }, [prizes, drawWheel])

  useEffect(() => {
    if (!spinning || targetPrizeIndex === null) return

    const numPrizes = prizes.length
    const sliceAngle = 360 / numPrizes
    // Target: spin multiple full rotations + land on the target slice
    // Wheel top is -90deg. The pointer is at top.
    // We need the target slice center to align with the pointer at top.
    const targetSliceCenter = targetPrizeIndex * sliceAngle + sliceAngle / 2
    const targetRotation = 360 * 8 + (360 - targetSliceCenter)

    const startRotation = currentRotationRef.current % 360
    const totalSpin = targetRotation
    const duration = 5000
    const startTime = Date.now()

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const current = startRotation + totalSpin * eased
      setRotation(current)
      currentRotationRef.current = current

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        // Spin complete
        onSpinEnd(prizes[targetPrizeIndex])
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [spinning, targetPrizeIndex, prizes, onSpinEnd])

  return (
    <div className="wheel-container">
      {/* Pointer/arrow at top */}
      <div className="wheel-pointer">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <polygon points="20,50 0,0 40,0" fill="#FFD700" stroke="#CC8800" strokeWidth="2" />
          <polygon points="20,42 6,5 34,5" fill="#FFF0AA" />
        </svg>
      </div>

      <div
        className="wheel-spinner"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <canvas
          ref={canvasRef}
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          className="wheel-canvas"
        />
      </div>

      <button
        className="btn-spin"
        onClick={onSpinStart}
        disabled={spinning}
      >
        {spinning ? '...' : 'QUAY NGAY'}
      </button>
    </div>
  )
}
