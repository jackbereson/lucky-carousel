import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useGame2State } from '../../lib/hooks/useGame2State'
import { useGame2Players } from '../../lib/hooks/useGame2Players'
import { useCountdown } from '../../lib/hooks/useCountdown'
import './Game2HostPage.css'

export default function Game2HostPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { state, questions, loading } = useGame2State(sessionId)
  const { count: playerCount } = useGame2Players(sessionId)
  const remaining = useCountdown(state?.countdown_start ?? null, state?.countdown_duration ?? 30)
  const autoClosedRef = useRef<string | null>(null)
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [autoMode, setAutoMode] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const autoModeRef = useRef(false)
  const questionsRef = useRef(questions)

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const clockDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const currentIndex = state?.active_question_id
    ? questions.findIndex(q => q.id === state.active_question_id)
    : -1
  const isLastQuestion = currentIndex >= questions.length - 1

  // Keep refs in sync
  autoModeRef.current = autoMode
  questionsRef.current = questions

  // Auto-close when countdown reaches 0 + auto-advance if enabled
  const advancingRef = useRef(false)
  const prevCountdownStartRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip if countdown_start just changed (remaining might be stale from prev question)
    if (state?.countdown_start !== prevCountdownStartRef.current) {
      prevCountdownStartRef.current = state?.countdown_start ?? null
      return
    }

    if (
      remaining !== 0 ||
      !state?.active_question_id ||
      autoClosedRef.current === state.active_question_id ||
      advancingRef.current
    ) return

    autoClosedRef.current = state.active_question_id

    // Close question (disables mobile buttons)
    if (state.phase === 'question_active') {
      api.patch(`/game2/state/${sessionId}`, { phase: 'question_closed' })
    }

    // Auto-advance after 3s if auto mode is on
    if (autoModeRef.current) {
      const qs = questionsRef.current
      const idx = qs.findIndex(q => q.id === state.active_question_id)
      if (idx < 0) return

      const isLast = idx >= qs.length - 1
      autoNextTimerRef.current = setTimeout(async () => {
        advancingRef.current = true
        try {
          if (isLast) {
            await api.patch(`/game2/state/${sessionId}`, {
              phase: 'finished',
              active_question_id: null,
              countdown_start: null,
            })
          } else {
            const next = qs[idx + 1]
            await api.patch(`/game2/state/${sessionId}`, {
              active_question_id: next.id,
              phase: 'question_active',
              countdown_start: new Date().toISOString(),
              countdown_duration: next.time_limit_seconds,
            })
            // Only reset after API confirms, so the new countdown_start is set
            autoClosedRef.current = null
          }
        } finally {
          advancingRef.current = false
        }
      }, 3000)
    }
  }, [remaining, state?.active_question_id, state?.phase, sessionId])

  async function updateGameState(updates: Record<string, unknown>) {
    await api.patch(`/game2/state/${sessionId}`, updates)
  }

  async function handleStart() {
    if (questions.length === 0) return
    const first = questions[0]
    autoClosedRef.current = null
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    await updateGameState({
      active_question_id: first.id,
      phase: 'question_active',
      countdown_start: new Date().toISOString(),
      countdown_duration: first.time_limit_seconds,
    })
  }

  async function handleNext() {
    if (currentIndex < 0 || currentIndex >= questions.length - 1) return
    const next = questions[currentIndex + 1]
    autoClosedRef.current = null
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    await updateGameState({
      active_question_id: next.id,
      phase: 'question_active',
      countdown_start: new Date().toISOString(),
      countdown_duration: next.time_limit_seconds,
    })
  }

  async function handleFinish() {
    await updateGameState({
      phase: 'finished',
      active_question_id: null,
      countdown_start: null,
    })
  }

  if (loading) {
    return (
      <div className="host-loading">
        <div className="host-spinner" />
        <p>Dang tai...</p>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="host-loading">
        <p>Khong tim thay session.</p>
        <button className="host-btn-back" onClick={() => navigate('/admin')}>
          Ve Admin
        </button>
      </div>
    )
  }

  // Pre-game: waiting
  if (state.phase === 'waiting') {
    return (
      <div className="host-page">
        <div className="host-pregame">
          <h1 className="host-pregame-title">SAN SANG!</h1>
          <div className="host-pregame-stats">
            <div className="host-stat">
              <div className="host-stat-value">{questions.length}</div>
              <div className="host-stat-label">Cau Hoi</div>
            </div>
            <div className="host-stat">
              <div className="host-stat-value">{playerCount}</div>
              <div className="host-stat-label">Nguoi Choi</div>
            </div>
          </div>
          <label className="host-auto-toggle">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={e => setAutoMode(e.target.checked)}
            />
            <span>Auto (3s chuyen cau)</span>
          </label>
          <button
            className="host-btn-start"
            onClick={handleStart}
            disabled={questions.length === 0}
          >
            BAT DAU
          </button>
        </div>
      </div>
    )
  }

  // Finished
  if (state.phase === 'finished') {
    async function fetchLeaderboard() {
      const data = await api.get(`/game2/leaderboard/${sessionId}`)
      setLeaderboard(data)
      setShowResults(true)
    }

    return (
      <div className="host-page">
        <div className="host-finished">
          {!showResults ? (
            <>
              <div className="host-finished-icon">&#127942;</div>
              <h1 className="host-finished-title">KET THUC!</h1>
              <button className="host-btn-results" onClick={fetchLeaderboard}>
                XEM KET QUA
              </button>
              <button className="host-btn-back" onClick={() => navigate('/admin')}>
                Ve Admin
              </button>
            </>
          ) : (
            <>
              <h1 className="host-finished-title">&#127942; KET QUA &#127942;</h1>
              {leaderboard && leaderboard.leaderboard.length > 0 ? (
                <>
                  <div className="host-results-subtitle">
                    Top {leaderboard.leaderboard.length} tra loi nhanh nhat ({leaderboard.total_questions}/{leaderboard.total_questions} cau dung)
                  </div>
                  <div className="host-leaderboard">
                    {leaderboard.leaderboard.map((entry: any, idx: number) => (
                      <div key={entry.player_id} className={`host-lb-row host-lb-rank-${idx + 1}`}>
                        <div className="host-lb-rank">#{idx + 1}</div>
                        <div className="host-lb-avatar" style={{ background: entry.avatar_color }}>
                          {entry.player_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="host-lb-info">
                          <div className="host-lb-name">
                            {entry.player_name}
                            {entry.phone_last4 && <span className="host-lb-phone">****{entry.phone_last4}</span>}
                          </div>
                          <div className="host-lb-time">
                            {entry.company && <span className="host-lb-company">{entry.company}</span>}
                            {entry.company && ' · '}
                            {(entry.total_time_ms / 1000).toFixed(1)}s tong thoi gian
                          </div>
                        </div>
                        <div className="host-lb-score">
                          {entry.correct_count}/{leaderboard.total_questions}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="host-no-winners">
                  Khong co ai tra loi dung het {leaderboard?.total_questions} cau!
                </div>
              )}
              <button className="host-btn-back" onClick={() => navigate('/admin')}>
                Ve Admin
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Active question / closed / show_results
  const activeQuestion = currentIndex >= 0 ? questions[currentIndex] : null
  const countdownDone = remaining === 0

  return (
    <div className="host-page">
      <div className="host-active">
        <div className="host-question-number">
          CAU {currentIndex + 1} / {questions.length}
        </div>

        <div className={`host-countdown ${remaining <= 5 ? 'host-countdown-low' : ''}`}>
          {clockDisplay}
        </div>

        <div className="host-question-text">
          {activeQuestion?.question_text}
        </div>

        <label className="host-auto-toggle">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={e => setAutoMode(e.target.checked)}
          />
          <span>Auto (3s chuyen cau)</span>
        </label>

        {countdownDone && !autoMode && (
          <div className="host-next-actions">
            {isLastQuestion ? (
              <button className="host-btn-finish" onClick={handleFinish}>
                KET THUC
              </button>
            ) : (
              <button className="host-btn-next" onClick={handleNext}>
                CAU HOI TIEP THEO &rarr;
              </button>
            )}
          </div>
        )}

        {countdownDone && autoMode && (
          <div className="host-auto-countdown">
            Chuyen cau trong 3s...
          </div>
        )}
      </div>
    </div>
  )
}
