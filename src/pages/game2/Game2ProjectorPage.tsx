import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGame2State } from '../../lib/hooks/useGame2State'
import { useGame2Players } from '../../lib/hooks/useGame2Players'
import { useGame2Answers } from '../../lib/hooks/useGame2Answers'
import { useCountdown } from '../../lib/hooks/useCountdown'
import { api } from '../../lib/api'
import QRCodeDisplay from '../../components/QRCodeDisplay'
import ProjectorQuestion from '../../components/game2/ProjectorQuestion'
import ProjectorAnswers from '../../components/game2/ProjectorAnswers'
import ProjectorLeaderboard from '../../components/game2/ProjectorLeaderboard'
import type { Game2Answer } from '../../lib/types'
import './Game2ProjectorPage.css'

export default function Game2ProjectorPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state, questions, loading: stateLoading } = useGame2State(sessionId || '')
  const { players, count: playerCount } = useGame2Players(sessionId || '')
  const { answers } = useGame2Answers(sessionId || '', state?.active_question_id ?? null)

  // Fetch ALL answers for leaderboard (especially needed after F5 or when finished)
  const [allSessionAnswers, setAllSessionAnswers] = useState<Game2Answer[]>([])

  useEffect(() => {
    if (!sessionId || !state) return
    if (state.phase === 'show_results' || state.phase === 'finished') {
      api.get<Game2Answer[]>(`/game2/answers?session_id=${sessionId}`)
        .then(data => { if (data) setAllSessionAnswers(data) })
    }
  }, [sessionId, state?.phase])

  const remaining = useCountdown(
    state?.countdown_start ?? null,
    state?.countdown_duration ?? 0
  )

  // Find the active question
  const activeQuestion = useMemo(() => {
    if (!state?.active_question_id || !questions.length) return null
    return questions.find((q) => q.id === state.active_question_id) ?? null
  }, [state?.active_question_id, questions])

  // Find the index of the active question
  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestion) return 0
    const idx = questions.findIndex((q) => q.id === activeQuestion.id)
    return idx >= 0 ? idx : 0
  }, [activeQuestion, questions])

  // Use all session answers for leaderboard, fallback to current question answers
  const allAnswersForLeaderboard = useMemo(() => {
    return allSessionAnswers.length > 0 ? allSessionAnswers : answers
  }, [allSessionAnswers, answers])

  const playUrl = `${window.location.origin}/game2/play/${sessionId}`

  if (!sessionId) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__error">
          <div className="game2-projector__error-title">Lỗi</div>
          <div className="game2-projector__error-message">Không tìm thấy session ID</div>
        </div>
      </div>
    )
  }

  if (stateLoading) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__loading">
          <div className="game2-projector__loading-spinner" />
          Đang tải...
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__error">
          <div className="game2-projector__error-title">Không tìm thấy phiên</div>
          <div className="game2-projector__error-message">Session "{sessionId}" không tồn tại</div>
        </div>
      </div>
    )
  }

  // PHASE: waiting
  if (state.phase === 'waiting') {
    return (
      <div className="game2-projector">
        <div className="game2-projector__waiting">
          <div className="game2-projector__waiting-title">Tham gia ngay!</div>
          <QRCodeDisplay url={playUrl} size={300} />
          <div className="game2-projector__player-count">
            <span className="game2-projector__player-count-number">{playerCount}</span>
            <span className="game2-projector__player-count-label">người chơi</span>
          </div>
          <div className="game2-projector__waiting-message">Đang chờ người chơi...</div>
        </div>
      </div>
    )
  }

  // PHASE: question_active
  if (state.phase === 'question_active' && activeQuestion) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__question-phase">
          <ProjectorQuestion
            question={activeQuestion}
            questionIndex={activeQuestionIndex}
            totalQuestions={questions.length}
            remaining={remaining}
          />
        </div>
      </div>
    )
  }

  // PHASE: question_closed
  if (state.phase === 'question_closed' && activeQuestion) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__question-phase">
          <ProjectorQuestion
            question={activeQuestion}
            questionIndex={activeQuestionIndex}
            totalQuestions={questions.length}
            remaining={0}
            showOverlay
          />
        </div>
      </div>
    )
  }

  // PHASE: show_results
  if (state.phase === 'show_results' && activeQuestion) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__results">
          <div className="game2-projector__results-columns">
            <ProjectorAnswers
              question={activeQuestion}
              answers={answers}
              totalPlayers={playerCount}
              showCorrect
            />
            <ProjectorLeaderboard
              answers={allAnswersForLeaderboard}
              players={players}
              questions={questions}
            />
          </div>
        </div>
      </div>
    )
  }

  // PHASE: finished
  if (state.phase === 'finished') {
    return (
      <div className="game2-projector">
        <div className="game2-projector__finished">
          <ProjectorLeaderboard
            answers={allAnswersForLeaderboard}
            players={players}
            questions={questions}
            maxDisplay={20}
          />
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="game2-projector">
      <div className="game2-projector__loading">
        <div className="game2-projector__loading-spinner" />
        Đang tải...
      </div>
    </div>
  )
}
