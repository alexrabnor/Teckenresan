import { useEffect, useState, useRef } from 'react';
import type { Square } from '../types';

const AUTO_ADVANCE_MS = 5000;

interface Props {
  square: Square;
  playerName: string;
  onClose?: () => void;
}

export default function VideoModal({ square, playerName, onClose }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!onClose) return;
    startRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      const e = Date.now() - startRef.current;
      setElapsed(e);
      if (e >= AUTO_ADVANCE_MS) {
        clearInterval(interval);
        onClose();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onClose]);

  const progress = Math.min(elapsed / AUTO_ADVANCE_MS, 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card video-modal" onClick={e => e.stopPropagation()}>
        <div className="video-modal-header">
          <span className="video-modal-player">{playerName} landade på</span>
          <span className="video-modal-square-badge">#{square.squareNumber}</span>
        </div>

        <div className="video-sign-display">
          <div className="video-sign-emoji">{square.emoji}</div>
          <div className="video-sign-name">{square.name}</div>
          <div className="video-sign-translation">{square.translation}</div>
        </div>

        <div className="video-placeholder">
          <div className="video-placeholder-icon">▶</div>
          <div className="video-placeholder-text">Teckenvideo kommer snart</div>
        </div>

        {onClose ? (
          <>
            <div className="video-progress-bar-bg">
              <div className="video-progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="video-skip-hint" onClick={onClose}>Klicka för att hoppa →</div>
          </>
        ) : (
          <div className="video-waiting">Väntar på värden...</div>
        )}
      </div>
    </div>
  );
}
