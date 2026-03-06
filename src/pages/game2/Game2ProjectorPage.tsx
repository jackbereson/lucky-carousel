import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useGame2State } from '../../lib/hooks/useGame2State'
import { useGame2Players } from '../../lib/hooks/useGame2Players'
import { useGame2Answers } from '../../lib/hooks/useGame2Answers'
import { useCountdown } from '../../lib/hooks/useCountdown'
import QRCodeDisplay from '../../components/QRCodeDisplay'
import ProjectorQuestion from '../../components/game2/ProjectorQuestion'
import ProjectorAnswers from '../../components/game2/ProjectorAnswers'
import ProjectorLeaderboard from '../../components/game2/ProjectorLeaderboard'
import './Game2ProjectorPage.css'

export default function Game2ProjectorPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state, questions, loading: stateLoading } = useGame2State(sessionId || '')
  const { players, count: playerCount } = useGame2Players(sessionId || '')
  const { answers } = useGame2Answers(sessionId || '', state?.active_question_id ?? null)

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

  // Collect ALL answers across all questions for leaderboard
  // We use a separate hook call for the active question, but for the leaderboard
  // we need all answers. We'll fetch them via API
  // For now, pass what we have -- the page will use accumulated answers from results phase
  const allAnswersForLeaderboard = useMemo(() => {
    // In results / finished phases, we want all answers.
    // The useGame2Answers hook filters by questionId, so for leaderboard
    // we pass the current answers. The parent page could be enhanced to
    // collect all answers, but for now the leaderboard uses what's available.
    return answers
  }, [answers])

  const playUrl = `${window.location.origin}/game2/play/${sessionId}`

  if (!sessionId) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__error">
          <div className="game2-projector__error-title">Loi</div>
          <div className="game2-projector__error-message">Khong tim thay session ID</div>
        </div>
      </div>
    )
  }

  if (stateLoading) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__loading">
          <div className="game2-projector__loading-spinner" />
          Dang tai...
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="game2-projector">
        <div className="game2-projector__error">
          <div className="game2-projector__error-title">Khong tim thay phien</div>
          <div className="game2-projector__error-message">Session "{sessionId}" khong ton tai</div>
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
            <span className="game2-projector__player-count-label">nguoi choi</span>
          </div>
          <div className="game2-projector__waiting-message">Dang cho nguoi choi...</div>
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
          <div className="game2-projector__finished-title">Ket thuc!</div>
          <div className="game2-projector__finished-subtitle">
            Cam on {playerCount} nguoi choi da tham gia!
          </div>
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
        Dang tai...
      </div>
    </div>
  )
}
