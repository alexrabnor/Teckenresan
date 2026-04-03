import { useState } from 'react';
import type { Player } from '../types';

const AVATARS = ['🧍', '🧒', '👩', '👴', '🧑', '👧', '👦', '👵'];
const COLORS = ['#1e88e5', '#e53935', '#43a047', '#ff6f00', '#8e24aa', '#00acc1'];

interface Props {
  onReady: (players: Player[]) => void;
  onBack: () => void;
}

interface Draft {
  name: string;
  avatar: string;
  color: string;
}

export default function PlayerSetup({ onReady, onBack }: Props) {
  const [count, setCount] = useState(2);
  const [drafts, setDrafts] = useState<Draft[]>([
    { name: 'Spelare 1', avatar: '🧍', color: COLORS[0] },
    { name: 'Spelare 2', avatar: '🧒', color: COLORS[1] },
    { name: 'Spelare 3', avatar: '👩', color: COLORS[2] },
    { name: 'Spelare 4', avatar: '👴', color: COLORS[3] },
  ]);

  const update = (i: number, field: keyof Draft, val: string) => {
    setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const handleStart = () => {
    const players: Player[] = drafts.slice(0, count).map((d, i) => ({
      id: `local-${i}`,
      name: d.name.trim() || `Spelare ${i + 1}`,
      avatar: d.avatar,
      color: d.color,
      score: 0,
    }));
    onReady(players);
  };

  return (
    <div className="screen setup-screen">
      <div className="setup-content">
        <h2 className="setup-title">Spelare</h2>

        {/* Player count selector */}
        <div className="player-count-selector">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              className={`count-btn${count === n ? ' active' : ''}`}
              onClick={() => setCount(n)}
            >
              {n} {n === 1 ? 'spelare' : 'spelare'}
            </button>
          ))}
        </div>

        {/* Player config rows */}
        <div className="player-config-list">
          {Array.from({ length: count }).map((_, i) => {
            const d = drafts[i];
            return (
              <div key={i} className="player-config-row" style={{ borderLeftColor: d.color }}>
                {/* Avatar picker */}
                <select
                  className="avatar-select"
                  value={d.avatar}
                  onChange={e => update(i, 'avatar', e.target.value)}
                >
                  {AVATARS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>

                {/* Name input */}
                <input
                  className="player-name-input"
                  value={d.name}
                  maxLength={16}
                  placeholder={`Spelare ${i + 1}`}
                  onChange={e => update(i, 'name', e.target.value)}
                />

                {/* Color picker */}
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-dot${d.color === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => update(i, 'color', c)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={handleStart}>Börja spela!</button>
        <button className="btn-back" onClick={onBack}>← Tillbaka</button>
      </div>
    </div>
  );
}
