import './MobileWaiting.css'

interface MobileWaitingProps {
  playerName: string
}

export default function MobileWaiting({ playerName }: MobileWaitingProps) {
  return (
    <div className="mobile-waiting">
      <div className="mobile-waiting-avatar">
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      <div className="mobile-waiting-name">{playerName}</div>
      <div className="mobile-waiting-message">
        Đang chờ câu hỏi tiếp theo...
      </div>
      <div className="mobile-waiting-dots">
        <span className="mobile-waiting-dot" />
        <span className="mobile-waiting-dot" />
        <span className="mobile-waiting-dot" />
      </div>
    </div>
  )
}
