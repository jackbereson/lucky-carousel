import type { Question } from '../../lib/types'
import { api } from '../../lib/api'
import './QuestionList.css'

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Trắc Nghiệm',
  true_false: 'Đúng/Sai',
  text: 'Văn Bản',
}

export default function QuestionList({ questions, onEdit }: QuestionListProps) {
  async function handleDelete(question: Question) {
    if (!confirm(`Xóa câu hỏi: "${question.question_text}"?`)) return
    await api.delete(`/game2/questions/${question.id}`)
  }

  if (questions.length === 0) {
    return (
      <div className="question-list-empty">
        <p>Chưa có câu hỏi nào.</p>
        <p className="question-list-empty-hint">Bấm "Thêm Câu Hỏi" để bắt đầu.</p>
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
              Sửa
            </button>
            <button className="qi-btn qi-btn-delete" onClick={() => handleDelete(q)}>
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
