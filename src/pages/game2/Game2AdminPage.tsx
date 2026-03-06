import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { api } from '../../lib/api'
import { useGame2State } from '../../lib/hooks/useGame2State'
import { useGame2Players } from '../../lib/hooks/useGame2Players'
import { useGame2Answers } from '../../lib/hooks/useGame2Answers'
import QuestionList from '../../components/game2/QuestionList'
import QuestionEditor from '../../components/game2/QuestionEditor'
import GameControlPanel from '../../components/game2/GameControlPanel'
import type { Question } from '../../lib/types'
import './Game2AdminPage.css'

export default function Game2AdminPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const { state, questions, loading, refetchQuestions } = useGame2State(sessionId)
  const { count: playerCount } = useGame2Players(sessionId)
  const { count: answerCount } = useGame2Answers(sessionId, state?.active_question_id ?? null)

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAddQuestion() {
    setEditingQuestion(null)
    setShowEditor(true)
  }

  function handleEditQuestion(question: Question) {
    setEditingQuestion(question)
    setShowEditor(true)
  }

  function handleEditorClose() {
    setEditingQuestion(null)
    setShowEditor(false)
  }

  function handleImportCSV() {
    fileInputRef.current?.click()
  }

  function handleDownloadTemplate() {
    const header = 'question_text,option_a,option_b,option_c,option_d,correct_answer,time_limit'
    const example1 = 'Thủ đô Việt Nam là gì?,Hà Nội,Hồ Chí Minh,Đà Nẵng,Huế,Hà Nội,30'
    const example2 = 'Trái Đất quay quanh Mặt Trời?,Đúng,Sai,,,Đúng,20'
    const csv = [header, example1, example2].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setImporting(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[]
        const questionsToInsert = rows.map((row, i) => {
          const opts = [row.option_a, row.option_b, row.option_c, row.option_d].filter(o => o?.trim())
          const isTrueFalse = opts.length === 2 && opts.every(o => ['đúng', 'sai', 'dung', 'true', 'false'].includes(o.toLowerCase()))
          return {
            session_id: sessionId,
            question_text: row.question_text || row.question || '',
            question_type: isTrueFalse ? 'true_false' : 'multiple_choice',
            options: opts,
            correct_answer: row.correct_answer || row.answer || '',
            time_limit_seconds: parseInt(row.time_limit || row.time || '30') || 30,
            sort_order: questions.length + i + 1,
          }
        }).filter(q => q.question_text && q.options.length >= 2 && q.correct_answer)

        if (questionsToInsert.length === 0) {
          alert('Không tìm thấy câu hỏi hợp lệ trong file CSV.\n\nFormat: question_text, option_a, option_b, option_c, option_d, correct_answer, time_limit')
          setImporting(false)
          return
        }

        try {
          await api.post('/game2/questions/bulk', questionsToInsert)
          refetchQuestions()
          alert(`Đã import ${questionsToInsert.length} câu hỏi thành công!`)
        } catch (err: any) {
          alert('Lỗi import: ' + err.message)
        }
        setImporting(false)
      },
      error: () => {
        alert('Không đọc được file CSV')
        setImporting(false)
      }
    })
  }

  if (loading) {
    return (
      <div className="g2admin-loading">
        <div className="g2admin-spinner" />
        <p>Đang tải...</p>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="g2admin-loading">
        <p>Không tìm thấy session.</p>
        <button className="g2admin-back-btn" onClick={() => navigate('/')}>
          Về Trang Chủ
        </button>
      </div>
    )
  }

  const currentPhase = state.phase

  return (
    <div className="g2admin-page">
      <div className="g2admin-bg-effects">
        <div className="g2admin-bg-light g2admin-bg-light-1" />
        <div className="g2admin-bg-light g2admin-bg-light-2" />
      </div>

      <div className="g2admin-header">
        <div className="g2admin-header-left">
          <button className="g2admin-nav-btn" onClick={() => navigate('/admin')}>
            ← Quay Lại
          </button>
          <h1 className="g2admin-title">GAME 2 - ADMIN</h1>
        </div>
        <div className="g2admin-header-right">
          <span className="g2admin-session-id">Session: {sessionId.substring(0, 8)}...</span>
          <span className="g2admin-player-badge">{playerCount} người chơi</span>
        </div>
      </div>

      <div className="g2admin-content">
        {/* Left panel: Questions */}
        <div className="g2admin-panel g2admin-panel-left">
          <div className="g2admin-panel-header">
            <h2 className="g2admin-panel-title">Câu Hỏi ({questions.length})</h2>
            <div className="g2admin-panel-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button className="g2admin-template-btn" onClick={handleDownloadTemplate}>
                Template
              </button>
              <button className="g2admin-import-btn" onClick={handleImportCSV} disabled={importing}>
                {importing ? 'Đang import...' : 'Import CSV'}
              </button>
              <button className="g2admin-add-btn" onClick={handleAddQuestion}>
                + Thêm Câu Hỏi
              </button>
            </div>
          </div>
          <div className="g2admin-panel-body">
            <QuestionList questions={questions} onEdit={handleEditQuestion} />
          </div>
        </div>

        {/* Right panel: Game Controls */}
        <div className="g2admin-panel g2admin-panel-right">
          <GameControlPanel
            sessionId={sessionId}
            phase={currentPhase}
            questions={questions}
            activeQuestionId={state.active_question_id}
            playerCount={playerCount}
            answerCount={answerCount}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
          />
        </div>
      </div>

      {showEditor && (
        <QuestionEditor
          sessionId={sessionId}
          question={editingQuestion}
          nextSortOrder={questions.length + 1}
          onClose={handleEditorClose}
        />
      )}
    </div>
  )
}
