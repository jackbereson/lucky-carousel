import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame2State } from '../../lib/hooks/useGame2State'
import { api } from '../../lib/api'
import MobileWaiting from '../../components/game2/MobileWaiting'
import MobileQuestionCard from '../../components/game2/MobileQuestionCard'
import type { Game2Answer } from '../../lib/types'
import './Game2QuestionPage.css'

export default function Game2QuestionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const playerId = sessionId ? localStorage.getItem(`game2_player_${sessionId}`) : null
  const { state, questions, loading } = useGame2State(sessionId || '')

  const [playerName, setPlayerName] = useState('')
  const [, setHasAnswered] = useState(false)
  const [, setMyAnswer] = useState<string | null>(null)
  const [allMyAnswers, setAllMyAnswers] = useState<Game2Answer[]>([])

  // Redirect to register if not registered
  useEffect(() => {
    if (!sessionId) return
    if (!playerId) {
      navigate(`/game2/play/${sessionId}`, { replace: true })
    }
  }, [sessionId, playerId, navigate])

  // Fetch player name (redirect to register if player was deleted/reset)
  useEffect(() => {
    if (!playerId || !sessionId) return
    api.get(`/game2/players/${playerId}`)
      .then(data => {
        if (data) {
          setPlayerName(data.name)
        } else {
          // Player was deleted (session reset)
          localStorage.removeItem(`game2_player_${sessionId}`)
          navigate(`/game2/play/${sessionId}`, { replace: true })
        }
      })
      .catch(() => {
        localStorage.removeItem(`game2_player_${sessionId}`)
        navigate(`/game2/play/${sessionId}`, { replace: true })
      })
  }, [playerId, sessionId, navigate])

  // Reset answer state when question changes
  useEffect(() => {
    if (!state?.active_question_id || !playerId || !sessionId) {
      setHasAnswered(false)
      setMyAnswer(null)
      return
    }

    // Check if we already answered this question
    api.get(`/game2/answers/check?question_id=${state.active_question_id}&player_id=${playerId}`)
      .then(data => {
        if (data) {
          setHasAnswered(true)
          setMyAnswer(data.answer_text)
        } else {
          setHasAnswered(false)
          setMyAnswer(null)
        }
      })
      .catch(() => {
        setHasAnswered(false)
        setMyAnswer(null)
      })
  }, [state?.active_question_id, playerId, sessionId])

  // Fetch all my answers when finished
  useEffect(() => {
    if (state?.phase !== 'finished' || !playerId || !sessionId) return
    api.get<Game2Answer[]>(`/game2/answers?session_id=${sessionId}&player_id=${playerId}`)
      .then(data => { if (data) setAllMyAnswers(data) })
  }, [state?.phase, playerId, sessionId])

  const handleAnswered = useCallback((answerText: string) => {
    setHasAnswered(true)
    setMyAnswer(answerText)
  }, [])

  if (!sessionId || !playerId) return null
  if (loading) {
    return (
      <div className="g2-loading">
        <div className="g2-loading-spinner" />
      </div>
    )
  }
  if (!state) return null

  const activeQuestion = state.active_question_id
    ? questions.find(q => q.id === state.active_question_id)
    : null

  const questionIndex = activeQuestion
    ? questions.findIndex(q => q.id === activeQuestion.id)
    : -1
  const questionNumber = questionIndex + 1
  const totalQuestions = questions.length

  const isQuestionPhase = state.phase === 'question_active' || state.phase === 'question_closed'

  return (
    <div className="g2-question-page">
      {state.phase === 'waiting' && (
        <MobileWaiting playerName={playerName} />
      )}

      {/* Show question card during active AND closed phases */}
      {isQuestionPhase && activeQuestion && (
        <MobileQuestionCard
          key={activeQuestion.id}
          question={activeQuestion}
          sessionId={sessionId}
          playerId={playerId}
          countdownStart={state.countdown_start}
          countdownDuration={state.countdown_duration}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          disabled={state.phase === 'question_closed'}
          onAnswered={handleAnswered}
        />
      )}

      {/* Show results: just waiting message, no correct/incorrect */}
      {state.phase === 'show_results' && (
        <div className="g2-waiting-results">
          <div className="g2-waiting-results-icon">&#9203;</div>
          <div className="g2-waiting-results-title">Đang chờ câu hỏi tiếp...</div>
          {questionNumber > 0 && (
            <div className="g2-waiting-results-progress">
              Đã hoàn thành {questionNumber} / {totalQuestions} câu
            </div>
          )}
        </div>
      )}

      {state.phase === 'finished' && (
        <div className="g2-finished">
          <div className="g2-finished-icon">&#127942;</div>
          <div className="g2-finished-title">Game đã kết thúc!</div>
          <div className="g2-finished-sub">Cảm ơn {playerName} đã tham gia!</div>
          <div className="g2-finished-stats">
            <div className="g2-finished-stat">
              <div className="g2-finished-stat-value">
                {allMyAnswers.filter(a => a.is_correct).length}
              </div>
              <div className="g2-finished-stat-label">Đúng</div>
            </div>
            <div className="g2-finished-stat">
              <div className="g2-finished-stat-value">
                {allMyAnswers.length}
              </div>
              <div className="g2-finished-stat-label">Tổng</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
