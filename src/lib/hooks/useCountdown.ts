import { useState, useEffect, useRef } from 'react'

export function useCountdown(countdownStart: string | null, durationSeconds: number) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const rafRef = useRef<number>(0)
  const prevStartRef = useRef<string | null>(null)

  // Reset remaining SYNCHRONOUSLY when countdownStart changes
  // This prevents stale remaining=0 from previous countdown
  if (countdownStart !== prevStartRef.current) {
    prevStartRef.current = countdownStart
    if (!countdownStart) {
      if (remaining !== durationSeconds) setRemaining(durationSeconds)
    } else {
      const elapsed = (Date.now() - new Date(countdownStart).getTime()) / 1000
      const left = Math.max(0, Math.ceil(durationSeconds - elapsed))
      if (remaining !== left) setRemaining(left)
    }
  }

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)

    if (!countdownStart) {
      setRemaining(durationSeconds)
      return
    }

    const startTime = new Date(countdownStart).getTime()

    function tick() {
      const elapsed = (Date.now() - startTime) / 1000
      const left = Math.max(0, durationSeconds - elapsed)
      setRemaining(Math.ceil(left))
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [countdownStart, durationSeconds])

  return remaining
}
