import { useState } from 'react';
import LockedWorldModal from './LockedWorldModal';

const LOCKED_WORLDS = [
  {
    name: 'MAT',
    icon: '🍕',
    signs: [
      { emoji: '🍕', name: 'PIZZA' },
      { emoji: '🍎', name: 'ÄPPLE' },
      { emoji: '🥛', name: 'MJÖLK' },
      { emoji: '🍞', name: 'BRÖD' },
    ],
  },
  {
    name: 'VARDAG',
    icon: '🏠',
    signs: [
      { emoji: '🏠', name: 'HUS' },
      { emoji: '🚗', name: 'BIL' },
      { emoji: '📚', name: 'BOK' },
      { emoji: '🛏️', name: 'SÄNG' },
    ],
  },
  {
    name: 'FÄRGER',
    icon: '🎨',
    signs: [
      { emoji: '🔴', name: 'RÖD' },
      { emoji: '🔵', name: 'BLÅ' },
      { emoji: '🟢', name: 'GRÖN' },
      { emoji: '🟡', name: 'GUL' },
    ],
  },
];

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  const [previewWorld, setPreviewWorld] = useState<typeof LOCKED_WORLDS[number] | null>(null);

  return (
    <div className="screen intro-screen">
      <div className="intro-content">
        <div className="intro-emojis">🤟 🖐️ 👋</div>
        <h1 className="intro-title">TECKENRESAN</h1>
        <p className="intro-subtitle">Lär dig svenska teckenspråk – ett tecken i taget!</p>
        <div className="intro-worlds">
          <div className="intro-world-badge">
            <span>🐻</span> Djur
          </div>
          <div className="intro-world-badge">
            <span>👨‍👩‍👧</span> Familj
          </div>
          {LOCKED_WORLDS.map(w => (
            <button
              key={w.name}
              className="intro-world-badge locked intro-locked-btn"
              onClick={() => setPreviewWorld(w)}
              title="Klicka för att förhandsgranska"
            >
              <span>🔒</span> {w.name}
            </button>
          ))}
        </div>

        <button className="btn-primary intro-start-btn" onClick={onStart}>
          BÖRJA SPELA
        </button>
        <p className="intro-demo-note">Demo: 2 världar gratis · Tryck på 🔒 för att förhandsgranska</p>
      </div>

      {previewWorld && (
        <LockedWorldModal
          world={previewWorld}
          onClose={() => setPreviewWorld(null)}
        />
      )}
    </div>
  );
}
