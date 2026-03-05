import type { Participant } from '../lib/storage'
import './ParticipantsModal.css'

interface ParticipantsModalProps {
  participants: Participant[]
  onClose: () => void
  onDelete?: (id: string) => void
}

export default function ParticipantsModal({ participants, onClose, onDelete }: ParticipantsModalProps) {
  return (
    <div className="participants-modal-overlay" onClick={onClose}>
      <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
        <div className="participants-header">
          <h2>Danh Sách Người Chơi</h2>
          <span className="participants-count">{participants.length} người</span>
        </div>

        <div className="participants-table-wrapper">
          {participants.length === 0 ? (
            <p className="no-participants">Chưa có người chơi nào. Hãy import CSV trước!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ Tên</th>
                  <th>CCCD</th>
                  <th>SĐT</th>
                  {onDelete && <th>Xóa</th>}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.full_name}</td>
                    <td>{p.cccd}</td>
                    <td>{p.phone || '-'}</td>
                    {onDelete && (
                      <td>
                        <button className="btn-delete-participant" onClick={() => onDelete(p.id)}>
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button className="btn-close-participants" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  )
}
