import type { Square } from '../types';

interface Props {
  square: Square;
  playerName: string;
  onClose?: () => void;
}

export default function VideoModal({ square, playerName, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card video-modal" onClick={e => e.stopPropagation()}>
        <div className="video-modal-header">
          <span className="video-modal-player">{playerName} landade på:</span>
          <div className="video-modal-square-badge" style={{ background: '#43a047' }}>
            Ruta {square.squareNumber}
          </div>
        </div>

        <div className="video-sign-display">
          <div className="video-sign-emoji">{square.emoji}</div>
          <div className="video-sign-name">{square.name}</div>
          <div className="video-sign-translation">({square.translation})</div>
        </div>

        {/* Video placeholder – swap youtube ID when available */}
        <div className="video-placeholder">
          <div className="video-placeholder-icon">🤟</div>
          <div className="video-placeholder-text">
            <strong>Tecken för: {square.name}</strong>
            <p>Titta på hur man gör tecknet för {square.name.toLowerCase()}!</p>
            <p className="video-placeholder-sub">Video läggs till snart</p>
          </div>
        </div>

        {onClose && (
          <button className="video-close-btn" onClick={onClose}>
            Jag förstår! ✓
          </button>
        )}
        {!onClose && (
          <div className="video-waiting">Väntar på att {playerName} ska stänga...</div>
        )}
      </div>
    </div>
  );
}
