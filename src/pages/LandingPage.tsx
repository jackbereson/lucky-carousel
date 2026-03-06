import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const games = [
  {
    id: 1,
    title: 'Quay Tên',
    description: 'Quay carousel 3D chọn người may mắn từ danh sách',
    icon: '🎰',
    path: '/game1',
    color: '#FFD700',
  },
  {
    id: 2,
    title: 'Câu Hỏi',
    description: 'Quiz realtime - người chơi scan QR và trả lời câu hỏi',
    icon: '❓',
    path: '/admin',
    color: '#4A90D9',
  },
  {
    id: 3,
    title: 'Vòng Quay',
    description: 'Vòng quay may mắn truyền thống với các phần thưởng',
    icon: '🎡',
    path: '/game3',
    color: '#FF6B6B',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-bg-effects">
        <div className="landing-bg-light landing-bg-light-1" />
        <div className="landing-bg-light landing-bg-light-2" />
      </div>

      <div className="landing-content">
        <h1 className="landing-title">HOUZE GAME CENTER</h1>
        <p className="landing-subtitle">Chọn trò chơi để bắt đầu</p>

        <div className="game-cards">
          {games.map(game => (
            <button
              key={game.id}
              className="game-card"
              onClick={() => navigate(game.path)}
              style={{ '--card-color': game.color } as React.CSSProperties}
            >
              <span className="game-card-icon">{game.icon}</span>
              <h2 className="game-card-title">{game.title}</h2>
              <p className="game-card-desc">{game.description}</p>
              <span className="game-card-cta">Bắt đầu</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
