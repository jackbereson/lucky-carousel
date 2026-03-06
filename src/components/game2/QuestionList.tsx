import type { Question } from '../../lib/types'
import { api } from '../../lib/api'
import './QuestionList.css'

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Trac Nghiem',
  true_false: 'Dung/Sai',
  text: 'Van Ban',
}

export default function QuestionList({ questions, onEdit }: QuestionListProps) {
  async function handleDelete(question: Question) {
    if (!confirm(`Xoa cau hoi: "${question.question_text}"?`)) return
    await api.delete(`/game2/questions/${question.id}`)
  }

  if (questions.length === 0) {
    return (
      <div className="question-list-empty">
        <p>Chua co cau hoi nao.</p>
        <p className="question-list-empty-hint">Bam "Them Cau Hoi" de bat dau.</p>
      </div>
    )
  }

  return (
    <div className="question-list">
      {questions.map((q, index) => (
        <div key={q.id} className="question-item">
          <div className="question-item-header">
            <span className="question-order">#{index + 1}</span>
            <span className={`question-type-badge badge-${q.question_type}`}>
              {TYPE_LABELS[q.question_type] || q.question_type}
            </span>
            <span className="question-time">{q.time_limit_seconds}s</span>
          </div>

          <p className="question-text-preview">{q.question_text}</p>

          <div className="question-options-preview">
            {q.options.map((opt, i) => (
              <span
                key={i}
                className={`question-opt ${opt === q.correct_answer ? 'correct' : ''}`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </span>
            ))}
          </div>

          <div className="question-item-actions">
            <button className="qi-btn qi-btn-edit" onClick={() => onEdit(q)}>
              Sua
            </button>
            <button className="qi-btn qi-btn-delete" onClick={() => handleDelete(q)}>
              Xoa
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
