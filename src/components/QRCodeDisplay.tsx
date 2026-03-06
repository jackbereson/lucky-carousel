import { QRCodeSVG } from 'qrcode.react'
import './QRCodeDisplay.css'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export default function QRCodeDisplay({ url, size = 300 }: QRCodeDisplayProps) {
  return (
    <div className="qr-display">
      <div className="qr-display__container">
        <QRCodeSVG value={url} size={size} level="M" />
      </div>
      <div className="qr-display__url">{url}</div>
    </div>
  )
}
