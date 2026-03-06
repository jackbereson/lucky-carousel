import './MobileWaiting.css'

interface MobileWaitingProps {
  playerName: string
}

export default function MobileWaiting({ playerName }: MobileWaitingProps) {
  const initial = playerName.charAt(0).toUpperCase()

  return (
    <div className="mobile-waiting">
      <div
        className="mobile-waiting-avatar"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)' }}
      >
        {initial}
      </div>
      <div className="mobile-waiting-name">{playerName}</div>
      <div className="mobile-waiting-message">
        Dang cho cau hoi tiep theo...
      </div>
      <div className="mobile-waiting-dots">
        <span className="mobile-waiting-dot" />
        <span className="mobile-waiting-dot" />
        <span className="mobile-waiting-dot" />
      </div>
    </div>
  )
}
