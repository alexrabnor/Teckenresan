import type { World, Player } from '../types';
import Dice from './Dice';

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

export default function Panel({
  world, players, currentPlayerIndex, squareNumber, diceValue,
  isRolling, stepsToTheme, canRoll, nextWorldName, onRoll,
}: Props) {
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="panel">
      {/* World header */}
      <div className="panel-world-header" style={{ background: world.pathColor }}>
        <span className="panel-world-icon">{world.icon}</span>
        <span className="panel-world-name">TEMA: {world.name}</span>
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
            .map((p, i) => {
              const rankLabels = ['1:a', '2:a', '3:a', '4:a'];
              return (
                <div key={p.id} className="panel-score-row" style={{ borderLeftColor: p.color }}>
                  <span className={`panel-rank-pill${i === 0 ? ' panel-rank-pill-first' : ''}`}>
                    {rankLabels[i] ?? `#${i + 1}`}
                  </span>
                  <span className="panel-score-avatar">{p.avatar}</span>
                  <span className="panel-score-name">{p.name}</span>
                  <span className="panel-score-pts">{p.score} p</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
