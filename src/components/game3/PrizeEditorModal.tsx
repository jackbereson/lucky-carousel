import { useState } from 'react'
import type { Prize } from '../../lib/storage'
import { savePrizes } from '../../lib/storage'
import './PrizeEditorModal.css'

interface PrizeEditorModalProps {
  prizes: Prize[]
  onClose: () => void
  onSaved: () => void
}

const PRESET_COLORS = [
  '#E63946', '#457B9D', '#2A9D8F', '#E9C46A',
  '#F4A261', '#264653', '#6A4C93', '#1982C4',
  '#FF595E', '#8AC926', '#FF924C', '#36949D',
]

export default function PrizeEditorModal({ prizes, onClose, onSaved }: PrizeEditorModalProps) {
  const [items, setItems] = useState<Prize[]>(prizes)
  const [newName, setNewName] = useState('')

  function addPrize() {
    if (!newName.trim()) return
    const color = PRESET_COLORS[items.length % PRESET_COLORS.length]
    setItems([...items, { id: crypto.randomUUID(), name: newName.trim(), color }])
    setNewName('')
  }

  function removePrize(id: string) {
    setItems(items.filter(p => p.id !== id))
  }

  function updateName(id: string, name: string) {
    setItems(items.map(p => p.id === id ? { ...p, name } : p))
  }

  function updateColor(id: string, color: string) {
    setItems(items.map(p => p.id === id ? { ...p, color } : p))
  }

  function handleSave() {
    savePrizes(items.filter(p => p.name.trim()))
    onSaved()
    onClose()
  }

  return (
    <div className="prize-editor-overlay" onClick={onClose}>
      <div className="prize-editor-modal" onClick={e => e.stopPropagation()}>
        <h2 className="prize-editor-title">THIẾT LẬP GIẢI THƯỞNG</h2>

        <div className="prize-add-row">
          <input
            type="text"
            placeholder="Tên giải thưởng..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPrize()}
            className="prize-input"
          />
          <button className="btn-add-prize" onClick={addPrize}>Thêm</button>
        </div>

        <div className="prize-list">
          {items.length === 0 && (
            <p className="prize-empty">Chưa có giải thưởng nào</p>
          )}
          {items.map(prize => (
            <div key={prize.id} className="prize-item">
              <input
                type="color"
                value={prize.color}
                onChange={e => updateColor(prize.id, e.target.value)}
                className="prize-color-picker"
              />
              <input
                type="text"
                value={prize.name}
                onChange={e => updateName(prize.id, e.target.value)}
                className="prize-name-input"
              />
              <button className="btn-remove-prize" onClick={() => removePrize(prize.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="prize-editor-actions">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save-prizes" onClick={handleSave}>Lưu ({items.length} giải)</button>
        </div>
      </div>
    </div>
  )
}
