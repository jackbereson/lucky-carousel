import { useMemo } from 'react'
import type { Game2Answer, Game2Player, Question } from '../../lib/types'
import './ProjectorLeaderboard.css'

interface ProjectorLeaderboardProps {
  answers: Game2Answer[]
  players: Game2Player[]
  questions: Question[]
  maxDisplay?: number
}

interface PlayerScore {
  player: Game2Player
  correctCount: number
  avgTimeMs: number
  totalAnswers: number
}

export default function ProjectorLeaderboard({
  answers,
  players,
  questions,
  maxDisplay = 10,
}: ProjectorLeaderboardProps) {
  const scores = useMemo(() => {
    const playerMap = new Map<string, Game2Player>()
    for (const p of players) {
      playerMap.set(p.id, p)
    }

    // Aggregate answers across ALL questions for each player
    const scoreMap = new Map<string, { correct: number; totalTime: number; answerCount: number }>()

    for (const answer of answers) {
      const existing = scoreMap.get(answer.player_id) || { correct: 0, totalTime: 0, answerCount: 0 }
      existing.answerCount++
      existing.totalTime += answer.time_taken_ms
      if (answer.is_correct) {
        existing.correct++
      }
      scoreMap.set(answer.player_id, existing)
    }

    const result: PlayerScore[] = []
    for (const [playerId, data] of scoreMap) {
      const player = playerMap.get(playerId)
      if (player) {
        result.push({
          player,
          correctCount: data.correct,
          avgTimeMs: data.answerCount > 0 ? data.totalTime / data.answerCount : 0,
          totalAnswers: data.answerCount,
        })
      }
    }

    // Sort by correct answers DESC, then by avg time ASC (faster is better)
    result.sort((a, b) => {
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount
      return a.avgTimeMs - b.avgTimeMs
    })

    return result.slice(0, maxDisplay)
  }, [answers, players, questions, maxDisplay])

  const formatTime = (ms: number) => {
    if (ms === 0) return '-'
    return (ms / 1000).toFixed(1) + 's'
  }

  return (
    <div className="projector-leaderboard">
      <div className="projector-leaderboard__title">Bảng xếp hạng</div>
      <div className="projector-leaderboard__list">
        {scores.map((score, idx) => {
          const rank = idx + 1
          const rankClass = rank <= 3 ? ` projector-leaderboard__row--rank-${rank}` : ''

          return (
            <div key={score.player.id} className={`projector-leaderboard__row${rankClass}`}>
              <div className="projector-leaderboard__rank">{rank}</div>
              <div className="projector-leaderboard__avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div className="projector-leaderboard__name">
                {score.player.name}
                {score.player.phone && ` · ****${score.player.phone.slice(-4)}`}
                {score.player.company && ` · ${score.player.company}`}
              </div>
              <div className="projector-leaderboard__stats">
                <div className="projector-leaderboard__stat">
                  <span className="projector-leaderboard__stat-value projector-leaderboard__correct">
                    {score.correctCount}/{questions.length}
                  </span>
                  <span className="projector-leaderboard__stat-label">Đúng</span>
                </div>
                <div className="projector-leaderboard__stat">
                  <span className="projector-leaderboard__stat-value">
                    {formatTime(score.avgTimeMs)}
                  </span>
                  <span className="projector-leaderboard__stat-label">TB</span>
                </div>
              </div>
            </div>
          )
        })}

        {scores.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px', fontSize: '1.2rem' }}>
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  )
}
