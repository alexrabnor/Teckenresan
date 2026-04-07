import { useState } from 'react';
import HowToPlayModal from './HowToPlayModal';

interface Props {
  onLocal: () => void;
  onOnline: () => void;
  onBack: () => void;
}

export default function ModeSelect({ onLocal, onOnline, onBack }: Props) {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div className="screen mode-screen">
      <div className="mode-content">
        <h2 className="mode-title">Välj spelläge</h2>
        <div className="mode-cards">
          <button className="mode-card" onClick={onLocal}>
            <div className="mode-card-icon">🎮</div>
            <div className="mode-card-title">Lokal</div>
            <div className="mode-card-desc">1–4 spelare på samma enhet. Turas om att slå tärningen.</div>
            <div className="mode-card-tag">Samma skärm</div>
          </button>

          <button className="mode-card" onClick={onOnline}>
            <div className="mode-card-icon">📱</div>
            <div className="mode-card-title">Online</div>
            <div className="mode-card-desc">Spela med vänner på egna enheter via en rums-kod.</div>
            <div className="mode-card-tag">Olika enheter</div>
          </button>
        </div>
        <button className="btn-howto" onClick={() => setShowHowTo(true)}>
          <span className="btn-howto-icon">🤟</span>
          Hur spelar man?
        </button>
        <button className="btn-back" onClick={onBack}>← Tillbaka</button>
      </div>

      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
