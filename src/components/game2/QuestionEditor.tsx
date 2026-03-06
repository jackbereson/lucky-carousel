import { useState, useEffect } from 'react'
import type { Question } from '../../lib/types'
import { api } from '../../lib/api'
import './QuestionEditor.css'

interface QuestionEditorProps {
  sessionId: string
  question: Question | null
  nextSortOrder: number
  onClose: () => void
}

const DEFAULT_OPTIONS = ['', '', '', '']
const TRUE_FALSE_OPTIONS = ['Dung', 'Sai']

export default function QuestionEditor({ sessionId, question, nextSortOrder, onClose }: QuestionEditorProps) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false'>('multiple_choice')
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS)
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text)
      setQuestionType(question.question_type as 'multiple_choice' | 'true_false')
      setOptions(
        question.question_type === 'true_false'
          ? TRUE_FALSE_OPTIONS
          : question.options.length >= 4
            ? question.options
            : [...question.options, ...Array(4 - question.options.length).fill('')]
      )
      setCorrectAnswer(question.correct_answer)
      setTimeLimit(question.time_limit_seconds)
    }
  }, [question])

  function handleTypeChange(type: 'multiple_choice' | 'true_false') {
    setQuestionType(type)
    if (type === 'true_false') {
      setOptions(TRUE_FALSE_OPTIONS)
      setCorrectAnswer('')
    } else {
      setOptions(DEFAULT_OPTIONS)
      setCorrectAnswer('')
    }
  }

  function handleOptionChange(index: number, value: string) {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  async function handleSave() {
    if (!questionText.trim()) return
    if (!correctAnswer) return

    const validOptions = questionType === 'true_false'
      ? TRUE_FALSE_OPTIONS
      : options.filter(o => o.trim() !== '')

    if (questionType === 'multiple_choice' && validOptions.length < 2) return

    setSaving(true)

    const data = {
      session_id: sessionId,
      question_text: questionText.trim(),
      question_type: questionType,
      options: validOptions,
      correct_answer: correctAnswer,
      time_limit_seconds: timeLimit,
      sort_order: question ? question.sort_order : nextSortOrder,
    }

    if (question) {
      await api.put(`/game2/questions/${question.id}`, data)
    } else {
      await api.post('/game2/questions', data)
    }

    setSaving(false)
    onClose()
  }

  const currentOptions = questionType === 'true_false' ? TRUE_FALSE_OPTIONS : options

  return (
    <div className="question-editor-overlay" onClick={onClose}>
      <div className="question-editor" onClick={e => e.stopPropagation()}>
        <h2 className="question-editor-title">
          {question ? 'Chinh Sua Cau Hoi' : 'Tao Cau Hoi Moi'}
        </h2>

        <div className="qe-field">
          <label className="qe-label">Cau Hoi</label>
          <textarea
            className="qe-textarea"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            placeholder="Nhap noi dung cau hoi..."
            rows={3}
          />
        </div>

        <div className="qe-field">
          <label className="qe-label">Loai Cau Hoi</label>
          <div className="qe-type-selector">
            <button
              className={`qe-type-btn ${questionType === 'multiple_choice' ? 'active' : ''}`}
              onClick={() => handleTypeChange('multiple_choice')}
            >
              Trac Nghiem
            </button>
            <button
              className={`qe-type-btn ${questionType === 'true_false' ? 'active' : ''}`}
              onClick={() => handleTypeChange('true_false')}
            >
              Dung / Sai
            </button>
          </div>
        </div>

        <div className="qe-field">
          <label className="qe-label">Cac Lua Chon</label>
          <div className="qe-options">
            {currentOptions.map((opt, i) => (
              <div key={i} className="qe-option-row">
                <input
                  type="radio"
                  name="correct-answer"
                  className="qe-radio"
                  checked={correctAnswer === (questionType === 'true_false' ? opt : opt)}
                  onChange={() => setCorrectAnswer(opt)}
                  disabled={questionType === 'multiple_choice' && !opt.trim()}
                />
                {questionType === 'true_false' ? (
                  <span className="qe-option-text">{opt}</span>
                ) : (
                  <input
                    type="text"
                    className="qe-option-input"
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Lua chon ${String.fromCharCode(65 + i)}`}
                  />
                )}
                {correctAnswer === opt && opt && (
                  <span className="qe-correct-badge">Dap an dung</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="qe-field">
          <label className="qe-label">Thoi Gian (giay)</label>
          <input
            type="number"
            className="qe-time-input"
            value={timeLimit}
            onChange={e => setTimeLimit(Math.max(5, parseInt(e.target.value) || 30))}
            min={5}
            max={300}
          />
        </div>

        <div className="qe-actions">
          <button className="qe-btn qe-btn-cancel" onClick={onClose}>
            Huy
          </button>
          <button
            className="qe-btn qe-btn-save"
            onClick={handleSave}
            disabled={saving || !questionText.trim() || !correctAnswer}
          >
            {saving ? 'Dang luu...' : 'Luu'}
          </button>
        </div>
      </div>
    </div>
  )
}
