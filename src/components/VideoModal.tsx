import type { Square } from '../types';

interface Props {
  square: Square;
  playerName: string;
  squareColor?: string;
  onClose?: () => void;
}

// Konverterar alla YouTube-URL-format till embed-URL
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Redan en embed-URL
  if (url.includes('youtube.com/embed/')) return url;
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  // Annan URL (t.ex. direkt mp4-länk) – returnera som den är
  if (url.startsWith('http')) return url;
  return null;
}

export default function VideoModal({ square, playerName, squareColor = '#43a047', onClose }: Props) {
  const embedUrl = toEmbedUrl(square.videoUrl ?? '');
  const isYoutube = embedUrl?.includes('youtube.com/embed');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card video-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="video-modal-header">
          <span className="video-modal-player">{playerName} landade på:</span>
          <div className="video-modal-square-badge" style={{ background: squareColor }}>
            Ruta {square.squareNumber}
          </div>
        </div>

        {/* Tecken-info */}
        <div className="video-sign-display">
          <div className="video-sign-emoji">{square.emoji}</div>
          <div className="video-sign-name">{square.name}</div>
          <div className="video-sign-translation">({square.translation})</div>
        </div>

        {/* Video eller placeholder */}
        {embedUrl ? (
          <div className="video-embed-wrapper">
            {isYoutube ? (
              <iframe
                className="video-embed"
                src={embedUrl}
                title={`Tecken för ${square.name}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="video-embed"
                src={embedUrl}
                controls
                autoPlay
              />
            )}
          </div>
        ) : (
          <div className="video-placeholder">
            <div className="video-placeholder-icon">🤟</div>
            <div className="video-placeholder-text">
              <strong>Tecken för: {square.name}</strong>
              <p>Titta på hur man gör tecknet – video kommer snart!</p>
              <p className="video-placeholder-hint">
                Lägg till en YouTube-länk i <code>data.ts</code> för denna ruta.
              </p>
            </div>
          </div>
        )}

        {onClose ? (
          <button className="video-close-btn" onClick={onClose}>
            Jag förstår! ✓
          </button>
        ) : (
          <div className="video-waiting">Väntar på att {playerName} ska stänga...</div>
        )}
      </div>
    </div>
  );
}
