import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseReady, type Program } from '../lib/supabase'
import './HomePage.css'

export default function HomePage() {
  const [programName, setProgramName] = useState('')
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadPrograms()
  }, [])

  async function loadPrograms() {
    if (!supabaseReady) return
    const { data } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPrograms(data)
  }

  async function createProgram() {
    if (!programName.trim()) return
    if (!supabaseReady) {
      alert('Vui lòng cấu hình Supabase trước! (VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env)')
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('programs')
      .insert({ name: programName.trim() })
      .select()
      .single()
    setLoading(false)
    if (error) {
      alert('Lỗi tạo chương trình: ' + error.message)
      return
    }
    if (data) {
      const defaultPrizes = [
        { program_id: data.id, name: '10 XU', color: '#FF6B35', icon: '🪙', total_quantity: 99, remaining_quantity: 99 },
        { program_id: data.id, name: 'TIVI', color: '#E31C25', icon: '📺', total_quantity: 2, remaining_quantity: 2 },
        { program_id: data.id, name: '50 XU', color: '#4A90D9', icon: '💰', total_quantity: 50, remaining_quantity: 50 },
        { program_id: data.id, name: 'ĐIỆN THOẠI', color: '#9B59B6', icon: '📱', total_quantity: 3, remaining_quantity: 3 },
        { program_id: data.id, name: '100 XU', color: '#E67E22', icon: '🎁', total_quantity: 20, remaining_quantity: 20 },
        { program_id: data.id, name: 'VOUCHER', color: '#27AE60', icon: '🎫', total_quantity: 30, remaining_quantity: 30 },
        { program_id: data.id, name: '5 XU', color: '#E74C3C', icon: '🔴', total_quantity: 99, remaining_quantity: 99 },
        { program_id: data.id, name: 'LAPTOP', color: '#2C3E50', icon: '💻', total_quantity: 1, remaining_quantity: 1 },
      ]
      await supabase.from('prizes').insert(defaultPrizes)
      navigate(`/game/${data.id}`)
    }
  }

  return (
    <div className="home-page">
      <div className="home-bg-effects">
        <div className="bg-light bg-light-1" />
        <div className="bg-light bg-light-2" />
      </div>

      <div className="home-content">
        <h1 className="home-title">
          <span className="title-lucky">VÒNG QUAY</span>
          <span className="title-wheel">MAY MẮN</span>
        </h1>
        <p className="home-subtitle">Lucky Wheel</p>

        <div className="create-program-card">
          <h2>Tạo Chương Trình Mới</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nhập tên chương trình..."
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProgram()}
            />
            <button
              className="btn-create"
              onClick={createProgram}
              disabled={loading || !programName.trim()}
            >
              {loading ? 'Đang tạo...' : 'BẮT ĐẦU'}
            </button>
          </div>
        </div>

        {programs.length > 0 && (
          <div className="programs-list">
            <h3>Chương Trình Đã Tạo</h3>
            <div className="programs-grid">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="program-card"
                  onClick={() => navigate(`/game/${p.id}`)}
                >
                  <span className="program-icon">🎰</span>
                  <span className="program-name">{p.name}</span>
                  <span className="program-date">
                    {new Date(p.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
