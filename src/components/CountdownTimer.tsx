import './CountdownTimer.css'

interface CountdownTimerProps {
  remaining: number
  total: number
  size?: number
}

export default function CountdownTimer({ remaining, total, size = 220 }: CountdownTimerProps) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? remaining / total : 0
  const dashOffset = circumference * (1 - progress)

  // Color transitions: green -> yellow -> red
  const ratio = total > 0 ? remaining / total : 1
  let color: string
  if (ratio > 0.5) {
    color = '#4caf50' // green
  } else if (ratio > 0.25) {
    color = '#ffc107' // yellow
  } else {
    color = '#f44336' // red
  }

  const isUrgent = remaining <= 5 && remaining > 0

  return (
    <div
      className={`countdown-timer${isUrgent ? ' countdown-timer--urgent' : ''}`}
      style={{ width: size, height: size, '--countdown-color': color } as React.CSSProperties}
    >
      <div className="countdown-timer__glow" />
      <svg
        className="countdown-timer__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="countdown-timer__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="countdown-timer__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="countdown-timer__center">
        <span className="countdown-timer__number">{remaining}</span>
        <span className="countdown-timer__label">giay</span>
      </div>
    </div>
  )
}
