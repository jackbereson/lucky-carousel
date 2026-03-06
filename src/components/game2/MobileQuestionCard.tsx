import { useState } from 'react'
import { api } from '../../lib/api'
import { useCountdown } from '../../lib/hooks/useCountdown'
import type { Question } from '../../lib/types'
import './MobileQuestionCard.css'

interface MobileQuestionCardProps {
  question: Question
  sessionId: string
  playerId: string
  countdownStart: string | null
  countdownDuration: number
  questionNumber: number
  totalQuestions: number
  disabled?: boolean
  onAnswered: (answerText: string) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_CLASSES = ['mq-option-a', 'mq-option-b', 'mq-option-c', 'mq-option-d']

export default function MobileQuestionCard({
  question,
  sessionId,
  playerId,
  countdownStart,
  countdownDuration,
  questionNumber,
  totalQuestions,
  disabled = false,
  onAnswered,
}: MobileQuestionCardProps) {
  const remaining = useCountdown(countdownStart, countdownDuration)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')

  const hasAnswered = selectedAnswer !== null
  const timerPercent = countdownDuration > 0 ? (remaining / countdownDuration) * 100 : 0
  const isTimedOut = remaining === 0
  const isLocked = isTimedOut || disabled

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const clockDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  async function submitAnswer(answerText: string) {
    if (submitting || hasAnswered || isLocked) return
    setSubmitting(true)
    setSelectedAnswer(answerText)

    const startTime = countdownStart ? new Date(countdownStart).getTime() : Date.now()
    const timeTakenMs = Date.now() - startTime
    const isCorrect = answerText.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()

    try {
      await api.post('/game2/answers', {
        session_id: sessionId,
        question_id: question.id,
        player_id: playerId,
        answer_text: answerText,
        is_correct: isCorrect,
        time_taken_ms: timeTakenMs,
      })
    } catch (err: any) {
      console.error('Error submitting answer:', err)
    }

    setSubmitting(false)
    onAnswered(answerText)
  }

  function handleOptionClick(optionText: string) {
    submitAnswer(optionText)
  }

  function handleTextSubmit() {
    if (textAnswer.trim()) {
      submitAnswer(textAnswer.trim())
    }
  }

  return (
    <div className={`mq-card ${isTimedOut && !hasAnswered ? 'mq-timed-out' : ''}`}>
      {/* Question number */}
      <div className="mq-question-number">Câu {questionNumber} / {totalQuestions}</div>

      {/* Timer */}
      <div className={`mq-timer-number ${remaining <= 5 ? 'mq-timer-low' : ''}`}>{clockDisplay}</div>
      <div className="mq-timer-bar-wrapper">
        <div className="mq-timer-bar" style={{ width: `${timerPercent}%` }} />
      </div>

      {/* Question text */}
      <div className="mq-question-text">{question.question_text}</div>

      {/* Options or text input */}
      {question.question_type === 'text' ? (
        <div className="mq-text-input-wrapper">
          <input
            className="mq-text-input"
            type="text"
            placeholder="Nhập câu trả lời..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={hasAnswered || isLocked}
          />
          <button
            className="mq-text-submit-btn"
            onClick={handleTextSubmit}
            disabled={hasAnswered || !textAnswer.trim() || isLocked}
          >
            {hasAnswered ? 'Đã trả lời' : 'Gửi câu trả lời'}
          </button>
        </div>
      ) : (
        <div className="mq-options">
          {question.options.map((option, idx) => {
            const label = OPTION_LABELS[idx] || String(idx + 1)
            const colorClass = OPTION_CLASSES[idx] || OPTION_CLASSES[0]
            const isSelected = selectedAnswer === option
            const isNotSelected = hasAnswered && !isSelected

            return (
              <button
                key={idx}
                className={`mq-option-btn ${colorClass} ${isSelected ? 'mq-selected' : ''} ${isNotSelected ? 'mq-not-selected' : ''} ${isLocked && !hasAnswered ? 'mq-disabled' : ''}`}
                onClick={() => handleOptionClick(option)}
                disabled={hasAnswered || submitting || isLocked}
              >
                <span className="mq-option-label">{label}</span>
                <span className="mq-option-text">{option}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Timeout overlay - only show when local countdown reaches 0 */}
      {isTimedOut && !hasAnswered && (
        <div className="mq-timeout-overlay">
          <div className="mq-timeout-text">HẾT GIỜ!</div>
        </div>
      )}
    </div>
  )
}
