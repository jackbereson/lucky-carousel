import { useMemo } from 'react'
import type { Question, Game2Answer } from '../../lib/types'
import './ProjectorAnswers.css'

interface ProjectorAnswersProps {
  question: Question
  answers: Game2Answer[]
  totalPlayers: number
  showCorrect: boolean
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function ProjectorAnswers({
  question,
  answers,
  totalPlayers,
  showCorrect,
}: ProjectorAnswersProps) {
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const option of question.options) {
      counts[option] = 0
    }
    for (const answer of answers) {
      if (counts[answer.answer_text] !== undefined) {
        counts[answer.answer_text]++
      }
    }
    return counts
  }, [question.options, answers])

  const maxCount = Math.max(1, ...Object.values(distribution))

  return (
    <div className="projector-answers">
      <div className="projector-answers__title">Ket qua tra loi</div>
      <div className="projector-answers__stats">
        <strong>{answers.length}</strong> / {totalPlayers} nguoi choi da tra loi
      </div>
      <div className="projector-answers__bars">
        {question.options.map((option, idx) => {
          const count = distribution[option] || 0
          const widthPercent = (count / maxCount) * 100
          const isCorrect = option === question.correct_answer
          const barStyle = showCorrect
            ? isCorrect
              ? 'correct'
              : 'wrong'
            : 'default'

          return (
            <div
              key={idx}
              className={`projector-answers__row${showCorrect && isCorrect ? ' projector-answers__row--correct' : ''}`}
            >
              <div className="projector-answers__label">
                <span className="projector-answers__letter">{LETTERS[idx]}</span>
                <span className="projector-answers__option-text">{option}</span>
              </div>
              <div className="projector-answers__bar-track">
                <div
                  className={`projector-answers__bar-fill projector-answers__bar-fill--${barStyle}`}
                  style={{ width: count > 0 ? `${widthPercent}%` : '0%' }}
                >
                  {count > 0 && (
                    <span className="projector-answers__bar-count">{count}</span>
                  )}
                </div>
                {count === 0 && (
                  <span
                    className="projector-answers__bar-count projector-answers__bar-count--outside"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    0
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
