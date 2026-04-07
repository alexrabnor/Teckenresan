import { useState } from 'react';
import type { World, Player } from '../types';
import { PATH_LAYOUT } from '../data';
import Dice from './Dice';
import HowToPlayModal from './HowToPlayModal';

interface Props {
  world: World;
  players: Player[];
  currentPlayerIndex: number;
  squareNumber: number;
  diceValue: number | null;
  isRolling: boolean;
  stepsToTheme: number;
  canRoll: boolean;
  nextWorldName?: string;
  onRoll: () => void;
}

// Beräkna max antal spelsteg (squares + theme) i banan
const MAX_STEPS = PATH_LAYOUT.filter(n => n.type === 'square' || n.type === 'theme').length;

export default function Panel({
  world, players, currentPlayerIndex, squareNumber, diceValue,
  isRolling, stepsToTheme, canRoll, nextWorldName, onRoll,
}: Props) {
  const [showHowTo, setShowHowTo] = useState(false);
  const currentPlayer = players[currentPlayerIndex];

  // Beräkna framsteg baserat på hur många steg spelaren tagit
  const stepsCompleted = MAX_STEPS - stepsToTheme;
  const progress = Math.round((stepsCompleted / MAX_STEPS) * 100);

  return (
    <div className="panel">
      {/* World header */}
      <div className="panel-world-header" style={{ background: world.pathColor }}>
        <span className="panel-world-icon">{world.icon}</span>
        <span className="panel-world-name">TEMA: {world.name}</span>
        <button className="btn-howto-panel" onClick={() => setShowHowTo(true)} title="Hur man spelar">?</button>
      </div>

      {/* Progressbar */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar-label">Framsteg</div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Current player indicator */}
      <div className="panel-turn" style={{ borderColor: currentPlayer?.color }}>
        <span className="panel-turn-avatar">{currentPlayer?.avatar}</span>
        <div>
          <div className="panel-turn-label">DITT DRAG!</div>
          <div className="panel-turn-name">{currentPlayer?.name}</div>
          {squareNumber > 0 && (
            <div className="panel-square-info">Du är på ruta {squareNumber}</div>
          )}
        </div>
      </div>

      {/* Dice */}
      <div className="panel-dice-area">
        <Dice value={diceValue} isRolling={isRolling} />
      </div>

      {/* Roll button */}
      <button
        className={`roll-btn${!canRoll ? ' disabled' : ''}`}
        onClick={onRoll}
        disabled={!canRoll}
      >
        {isRolling ? 'Slår...' : 'SLÅ TÄRNINGEN'}
      </button>

      {/* Steps to theme */}
      <div className="panel-theme-info">
        {stepsToTheme > 0 ? (
          <>
            <div className="panel-next-label">NÄSTA TEMA:</div>
            <div className="panel-next-name">{world.name}</div>
            <div className="panel-next-steps">({stepsToTheme} steg)</div>
          </>
        ) : (
          nextWorldName && (
            <>
              <div className="panel-next-label">NÄSTA VÄRLD:</div>
              <div className="panel-next-name">{nextWorldName}</div>
            </>
          )
        )}
      </div>

      {/* Scoreboard */}
      {players.length > 1 && (
        <div className="panel-scores">
          <div className="panel-scores-title">Poäng</div>
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((p, i) => (
              <div key={p.id} className="panel-score-row" style={{ borderLeftColor: p.color }}>
                <span className="panel-score-rank">#{i + 1}</span>
                <span className="panel-score-avatar">{p.avatar}</span>
                <span className="panel-score-name">{p.name}</span>
                <span className="panel-score-pts">{p.score} p</span>
              </div>
            ))}
        </div>
      )}

      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
