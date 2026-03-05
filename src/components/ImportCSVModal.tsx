import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { getParticipants, saveParticipants, type Participant } from '../lib/storage'
import './ImportCSVModal.css'

interface ImportCSVModalProps {
  onClose: () => void
  onImported: () => void
}

export default function ImportCSVModal({ onClose, onImported }: ImportCSVModalProps) {
  const [preview, setPreview] = useState<Array<{ full_name: string; cccd: string; phone: string }>>([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function downloadTemplate() {
    const csvContent = 'ho_ten,cccd,sdt\nNguyễn Văn A,012345678901,0901234567\nTrần Thị B,012345678902,0912345678\n'
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_nguoi_choi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const parsed = rows.map((row) => ({
          full_name: row['ho_ten'] || row['full_name'] || row['name'] || row['Họ tên'] || row['Ho ten'] || '',
          cccd: row['cccd'] || row['CCCD'] || row['cmnd'] || row['CMND'] || row['Số CCCD'] || '',
          phone: row['phone'] || row['sdt'] || row['SDT'] || row['Số điện thoại'] || row['So dien thoai'] || '',
        })).filter((r) => r.full_name && r.cccd)

        setPreview(parsed)
      },
    })
  }

  function doImport() {
    if (preview.length === 0) return
    setImporting(true)

    const existing = getParticipants()
    const newParticipants: Participant[] = preview.map(p => ({
      id: crypto.randomUUID(),
      full_name: p.full_name,
      cccd: p.cccd,
      phone: p.phone || '',
    }))

    saveParticipants([...existing, ...newParticipants])
    setImporting(false)
    onImported()
    onClose()
  }

  return (
    <div className="csv-modal-overlay" onClick={onClose}>
      <div className="csv-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Import Danh Sách Người Chơi</h2>
        <p className="csv-hint">
          File CSV cần có các cột: <strong>ho_ten</strong>, <strong>cccd</strong>, <strong>sdt</strong> (không bắt buộc)
        </p>

        <div className="csv-template-row">
          <button className="btn-download-template" onClick={downloadTemplate}>
            ⬇ Tải file mẫu CSV
          </button>
        </div>

        <div className="csv-upload-area" onClick={() => fileRef.current?.click()}>
          <span className="csv-upload-icon">📄</span>
          <span>Nhấn để chọn file CSV</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        {preview.length > 0 && (
          <div className="csv-preview">
            <p className="csv-count">Tìm thấy <strong>{preview.length}</strong> người chơi</p>
            <div className="csv-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Họ Tên</th>
                    <th>CCCD</th>
                    <th>SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.full_name}</td>
                      <td>{p.cccd}</td>
                      <td>{p.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="csv-more">...và {preview.length - 10} người khác</p>
              )}
            </div>
          </div>
        )}

        <div className="csv-actions">
          <button className="btn-csv-cancel" onClick={onClose}>Hủy</button>
          <button
            className="btn-csv-import"
            onClick={doImport}
            disabled={preview.length === 0 || importing}
          >
            {importing ? 'Đang import...' : `Import ${preview.length} người`}
          </button>
        </div>
      </div>
    </div>
  )
}
