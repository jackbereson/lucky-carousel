import type { Question } from '../../lib/types'
import CountdownTimer from '../CountdownTimer'
import './ProjectorQuestion.css'

interface ProjectorQuestionProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  remaining: number
  showOverlay?: boolean
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function ProjectorQuestion({
  question,
  questionIndex,
  totalQuestions,
  remaining,
  showOverlay = false,
}: ProjectorQuestionProps) {
  const isTwo = question.question_type === 'true_false' || question.options.length === 2

  return (
    <div className="projector-question">
      <div className="projector-question__header">
        <div className="projector-question__number">
          Cau hoi {questionIndex + 1} / {totalQuestions}
        </div>
        <div className="projector-question__text">{question.question_text}</div>
      </div>

      <div className="projector-question__body">
        <div className={`projector-question__options${isTwo ? ' projector-question__options--two' : ''}`}>
          {question.options.map((option, idx) => (
            <div key={idx} className="projector-question__option">
              <span className="projector-question__option-letter">{LETTERS[idx]}</span>
              <span className="projector-question__option-text">{option}</span>
            </div>
          ))}
        </div>

        <div className="projector-question__timer">
          <CountdownTimer
            remaining={remaining}
            total={question.time_limit_seconds}
            size={200}
          />
        </div>
      </div>

      {showOverlay && (
        <div className="projector-question__overlay">
          <div className="projector-question__overlay-text">Het gio!</div>
        </div>
      )}
    </div>
  )
}
