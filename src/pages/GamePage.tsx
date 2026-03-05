import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getParticipants, getWinners, addWinner, saveParticipants, clearAll, type Participant } from '../lib/storage'
import NameRoller from '../components/NameRoller'
import WinnerModal from '../components/WinnerModal'
import ImportCSVModal from '../components/ImportCSVModal'
import ParticipantsModal from '../components/ParticipantsModal'
import './GamePage.css'

export default function GamePage() {
  const navigate = useNavigate()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [spinning, setSpinning] = useState(false)
  const [targetParticipantIndex, setTargetParticipantIndex] = useState<number | null>(null)
  const [winnerParticipant, setWinnerParticipant] = useState<Participant | null>(null)
  const [showImportCSV, setShowImportCSV] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([])

  const loadData = useCallback(() => {
    const allParticipants = getParticipants()
    const winners = getWinners()
    const wonIds = new Set(winners.map(w => w.participant.id))
    const available = allParticipants.filter(p => !wonIds.has(p.id))
    setParticipants(allParticipants)
    setAvailableParticipants(available)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleSpinStart() {
    if (spinning) return
    if (availableParticipants.length === 0) {
      alert('Không có người chơi khả dụng! Hãy import CSV trước.')
      return
    }

    const participantIdx = Math.floor(Math.random() * availableParticipants.length)
    setTargetParticipantIndex(participantIdx)
    setSpinning(true)
  }

  function handleRollEnd(participant: Participant) {
    setSpinning(false)
    addWinner(participant)
    setWinnerParticipant(participant)
    setAvailableParticipants(prev => prev.filter(p => p.id !== participant.id))
  }

  function closeWinnerModal() {
    setWinnerParticipant(null)
  }

  function handleClearAll() {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu?')) {
      clearAll()
      loadData()
    }
  }

  return (
    <div className="game-page">
      <div className="game-bg-effects" />

      <div className="game-header">
        <div className="header-actions">
          <button className="btn-header" onClick={() => setShowImportCSV(true)}>
            📄 Import CSV
          </button>
          <button className="btn-header" onClick={() => setShowParticipants(true)}>
            👥 Người Chơi ({participants.length})
          </button>
          <button className="btn-header btn-results" onClick={() => navigate('/results')}>
            🏆 Kết Quả
          </button>
          <button className="btn-header btn-danger" onClick={handleClearAll}>
            🗑 Xóa
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="roller-section">
          <NameRoller
            participants={availableParticipants}
            spinning={spinning}
            targetIndex={targetParticipantIndex}
            onSpinEnd={handleRollEnd}
            onSpinStart={handleSpinStart}
          />
          <p className="available-count">
            Người chơi còn lại: <strong>{availableParticipants.length}</strong>
            <button className="btn-edit-participants" onClick={() => setShowParticipants(true)}>
              ✏️
            </button>
          </p>
        </div>
      </div>

      {winnerParticipant && (
        <WinnerModal
          participant={winnerParticipant}
          onClose={closeWinnerModal}
        />
      )}

      {showImportCSV && (
        <ImportCSVModal
          onClose={() => setShowImportCSV(false)}
          onImported={loadData}
        />
      )}

      {showParticipants && (
        <ParticipantsModal
          participants={participants}
          onClose={() => setShowParticipants(false)}
          onDelete={(id) => {
            const updated = participants.filter(p => p.id !== id)
            saveParticipants(updated)
            loadData()
          }}
        />
      )}
    </div>
  )
}
