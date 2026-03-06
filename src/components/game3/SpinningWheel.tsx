import { useEffect, useRef, useState, useMemo } from 'react'
import type { Prize } from '../../lib/storage'
import './SpinningWheel.css'

interface SpinningWheelProps {
  prizes: Prize[]
  spinning: boolean
  targetIndex: number | null
  onSpinEnd: (prize: Prize) => void
  onSpinStart: () => void
}

const DURATION = 6000
const MIN_FULL_ROTATIONS = 5

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function SpinningWheel({
  prizes,
  spinning,
  targetIndex,
  onSpinEnd,
  onSpinStart,
}: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0)
  const animRef = useRef<number | null>(null)
  const rotationRef = useRef(0)
  const hasCalledEnd = useRef(false)
  const [ledPhase, setLedPhase] = useState(0)

  const n = prizes.length
  const segmentAngle = n > 0 ? 360 / n : 360

  useEffect(() => {
    if (!spinning) return
    const interval = setInterval(() => {
      setLedPhase(prev => prev + 1)
    }, 200)
    return () => clearInterval(interval)
  }, [spinning])

  useEffect(() => {
    if (!spinning || targetIndex === null || n === 0) return

    hasCalledEnd.current = false
    const startRotation = rotationRef.current

    const targetSegmentCenter = targetIndex * segmentAngle + segmentAngle / 2
    const landAngle = 360 - targetSegmentCenter
    const segmentJitter = (Math.random() - 0.5) * segmentAngle * 0.6
    const finalLandAngle = landAngle + segmentJitter
    const totalRotation = MIN_FULL_ROTATIONS * 360 + ((finalLandAngle - (startRotation % 360)) + 360) % 360
    const targetRotation = startRotation + totalRotation
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOutQuart(progress)
      const currentRotation = startRotation + (targetRotation - startRotation) * eased

      rotationRef.current = currentRotation
      setRotation(currentRotation)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else if (!hasCalledEnd.current) {
        hasCalledEnd.current = true
        rotationRef.current = targetRotation
        setRotation(targetRotation)
        onSpinEnd(prizes[targetIndex!])
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [spinning, targetIndex])

  const leds = useMemo(() => {
    const count = 24
    const items = []
    const radius = 250 + 6
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360
      const rad = (angle - 90) * (Math.PI / 180)
      const x = Math.cos(rad) * radius
      const y = Math.sin(rad) * radius
      items.push({ angle, x, y, index: i })
    }
    return items
  }, [])

  const segments = useMemo(() => {
    if (n === 0) return []
    return prizes.map((p, i) => ({
      prize: p,
      color: p.color,
      startAngle: i * segmentAngle,
      endAngle: (i + 1) * segmentAngle,
    }))
  }, [prizes, n, segmentAngle])

  const conicGradient = useMemo(() => {
    if (n === 0) return 'rgba(30, 30, 60, 0.8)'
    const stops = segments.map((seg, i) => {
      const start = seg.startAngle
      const end = seg.endAngle
      if (i < segments.length - 1) {
        return `${seg.color} ${start}deg ${end - 0.5}deg, rgba(0,0,0,0.8) ${end - 0.5}deg ${end}deg`
      }
      return `${seg.color} ${start}deg ${end}deg`
    })
    return `conic-gradient(from 0deg, ${stops.join(', ')})`
  }, [segments, n])

  return (
    <div className="spinning-wheel-wrapper">
      <div className="wheel-stage">
        <div className="wheel-pointer" />
        <div className="wheel-outer-ring" />

        <div className="wheel-leds">
          {leds.map(led => (
            <div
              key={led.index}
              className={`wheel-led ${(led.index + ledPhase) % 2 === 0 ? 'on' : 'off'}`}
              style={{
                transform: `translate(${led.x - 5}px, ${led.y - 5}px)`,
                color: (led.index + ledPhase) % 2 === 0 ? '#FFD700' : '#fff',
              }}
            />
          ))}
        </div>

        <div className="wheel-disc" style={{ transform: `rotate(${rotation}deg)` }}>
          {n === 0 ? (
            <div className="wheel-empty">
              <p>Chua co giai thuong</p>
              <p>Hay thiet lap giai thuong!</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: conicGradient,
                }}
              />

              {segments.map((seg, i) => (
                <div
                  key={`line-${i}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '50%',
                    height: '2px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    transformOrigin: '0% 50%',
                    transform: `rotate(${seg.startAngle}deg)`,
                  }}
                />
              ))}

              {segments.map((seg, i) => {
                const midAngle = seg.startAngle + segmentAngle / 2
                return (
                  <div
                    key={`text-${i}`}
                    className="wheel-segment-text"
                    style={{ transform: `rotate(${midAngle}deg)` }}
                  >
                    <span className="wheel-segment-label">
                      {seg.prize.name}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div
          className={`wheel-center ${spinning ? 'is-spinning' : ''}`}
          onClick={!spinning && n > 0 ? onSpinStart : undefined}
        >
          <span className="wheel-center-text">
            {spinning ? '...' : 'QUAY'}
          </span>
        </div>
      </div>

      <button
        className="btn-spin"
        onClick={onSpinStart}
        disabled={spinning || n === 0}
      >
        {spinning ? 'DANG QUAY...' : 'QUAY NGAY'}
      </button>
    </div>
  )
}
