import type { Question, Game2Phase } from '../../lib/types'
import { api } from '../../lib/api'
import './GameControlPanel.css'

interface GameControlPanelProps {
  sessionId: string
  phase: Game2Phase
  questions: Question[]
  activeQuestionId: string | null
  playerCount: number
  answerCount: number
  selectedQuestionId: string | null
  onSelectQuestion: (id: string | null) => void
}

const PHASE_CONFIG: Record<Game2Phase, { label: string; color: string }> = {
  waiting: { label: 'Chờ', color: '#FFD700' },
  question_active: { label: 'Đang Trả Lời', color: '#4ade80' },
  question_closed: { label: 'Đã Đóng', color: '#f97316' },
  show_results: { label: 'Kết Quả', color: '#6CB4EE' },
  finished: { label: 'Kết Thúc', color: '#ff6666' },
}

export default function GameControlPanel({
  sessionId,
  phase,
  questions,
  activeQuestionId,
  playerCount,
  answerCount,
  selectedQuestionId,
  onSelectQuestion,
}: GameControlPanelProps) {

  async function updateGameState(updates: Record<string, unknown>) {
    await api.patch(`/game2/state/${sessionId}`, updates)
  }

  async function handleStartQuestion() {
    if (!selectedQuestionId) return
    const question = questions.find(q => q.id === selectedQuestionId)
    if (!question) return

    await updateGameState({
      active_question_id: selectedQuestionId,
      phase: 'question_active',
      countdown_start: new Date().toISOString(),
      countdown_duration: question.time_limit_seconds,
    })
  }

  async function handleCloseAnswers() {
    await updateGameState({ phase: 'question_closed' })
  }

  async function handleShowResults() {
    await updateGameState({ phase: 'show_results' })
  }

  async function handleNextQuestion() {
    await updateGameState({
      phase: 'waiting',
      active_question_id: null,
      countdown_start: null,
    })
    onSelectQuestion(null)
  }

  async function handleFinish() {
    await updateGameState({
      phase: 'finished',
      active_question_id: null,
      countdown_start: null,
    })
  }

  const phaseInfo = PHASE_CONFIG[phase]
  const activeQuestion = questions.find(q => q.id === activeQuestionId)

  return (
    <div className="game-control-panel">
      <h2 className="gcp-title">Điều Khiển Game</h2>

      {/* Phase display */}
      <div className="gcp-phase-display">
        <span className="gcp-phase-label">Trạng Thái:</span>
        <span
          className="gcp-phase-value"
          style={{ '--phase-color': phaseInfo.color } as React.CSSProperties}
        >
          <span className="gcp-phase-dot" />
          {phaseInfo.label}
        </span>
      </div>

      {/* Stats */}
      <div className="gcp-stats">
        <div className="gcp-stat">
          <span className="gcp-stat-value">{playerCount}</span>
          <span className="gcp-stat-label">Người Chơi</span>
        </div>
        {activeQuestionId && (
          <div className="gcp-stat">
            <span className="gcp-stat-value">{answerCount}</span>
            <span className="gcp-stat-label">Trả Lời</span>
          </div>
        )}
      </div>

      {/* Active question info */}
      {activeQuestion && (
        <div className="gcp-active-question">
          <span className="gcp-aq-label">Câu hỏi hiện tại:</span>
          <p className="gcp-aq-text">{activeQuestion.question_text}</p>
        </div>
      )}

      {/* Question selector */}
      {(phase === 'waiting') && (
        <div className="gcp-question-select">
          <label className="gcp-select-label">Chọn Câu Hỏi</label>
          <select
            className="gcp-select"
            value={selectedQuestionId || ''}
            onChange={e => onSelectQuestion(e.target.value || null)}
          >
            <option value="">-- Chọn câu hỏi --</option>
            {questions.map((q, i) => (
              <option key={q.id} value={q.id}>
                #{i + 1}: {q.question_text.substring(0, 50)}
                {q.question_text.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control buttons */}
      <div className="gcp-controls">
        {phase === 'waiting' && (
          <button
            className="gcp-btn gcp-btn-start"
            onClick={handleStartQuestion}
            disabled={!selectedQuestionId}
          >
            Bắt Đầu Câu Hỏi
          </button>
        )}

        {phase === 'question_active' && (
          <button className="gcp-btn gcp-btn-close" onClick={handleCloseAnswers}>
            Đóng Trả Lời
          </button>
        )}

        {phase === 'question_closed' && (
          <button className="gcp-btn gcp-btn-results" onClick={handleShowResults}>
            Hiện Kết Quả
          </button>
        )}

        {phase === 'show_results' && (
          <button className="gcp-btn gcp-btn-next" onClick={handleNextQuestion}>
            Câu Hỏi Tiếp
          </button>
        )}

        {phase !== 'finished' && phase !== 'waiting' && (
          <button className="gcp-btn gcp-btn-finish" onClick={handleFinish}>
            Kết Thúc
          </button>
        )}

        {phase === 'finished' && (
          <button className="gcp-btn gcp-btn-reset" onClick={handleNextQuestion}>
            Chơi Lại
          </button>
        )}
      </div>
    </div>
  )
}
