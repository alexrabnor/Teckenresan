import type { Player } from '../types';

interface Props {
  players: Player[];
  sessionScores: Record<string, number>;
  showTotal?: boolean;
}

export default function ScoreBoard({ players, sessionScores, showTotal }: Props) {
  const sorted = [...players].sort(
    (a, b) => (b.score + (sessionScores[b.id] ?? 0)) - (a.score + (sessionScores[a.id] ?? 0))
  );

  return (
    <div className="scoreboard">
      {sorted.map((p, i) => {
        const session = sessionScores[p.id] ?? 0;
        const total = p.score + session;
        return (
          <div key={p.id} className="scoreboard-row" style={{ borderLeftColor: p.color }}>
            <span className="sb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
            <span className="sb-avatar">{p.avatar}</span>
            <span className="sb-name">{p.name}</span>
            <div className="sb-scores">
              {session > 0 && <span className="sb-session">+{session}</span>}
              {showTotal && <span className="sb-total">{total} p</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
