import type { World, PiecePos, Player } from '../types';
import { PATH_LAYOUT } from '../data';

const CELL = 100;
const SQ = 82;
const MARGIN = 9;
const BOARD_W = 6 * CELL;
const BOARD_H = 3 * CELL;

interface Props {
  world: World;
  pathIndex: number;
  piecePos: PiecePos;
  currentPlayer: Player;
  isMoving: boolean;
  noTransition: boolean;
}

const COLOR_MAP: Record<string, string> = {
  red: '#e53935',
  yellow: '#fdd835',
  blue: '#1e88e5',
  green: '#43a047',
};

export default function Board({ world, pathIndex, piecePos, currentPlayer, noTransition }: Props) {
  const pieceX = piecePos.col * CELL + CELL / 2 - 22;
  const pieceY = piecePos.row * CELL + CELL / 2 - 22;

  return (
    <div
      className="board"
      style={{
        width: BOARD_W,
        height: BOARD_H,
        background: world.backgroundColor,
      }}
    >
      {/* SVG path backdrop */}
      <svg
        className="board-svg"
        width={BOARD_W}
        height={BOARD_H}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Shadow path */}
        <path
          d="M 50,250 L 510,250 Q 550,250 550,210 L 550,90 Q 550,50 510,50 L 50,50"
          stroke={world.pathColor}
          strokeWidth="80"
          fill="none"
          strokeLinecap="round"
          opacity="0.15"
        />
        {/* Main path */}
        <path
          d="M 50,250 L 510,250 Q 550,250 550,210 L 550,90 Q 550,50 510,50 L 50,50"
          stroke={world.pathColor}
          strokeWidth="74"
          fill="none"
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Direction arrow at connector (col5, row1) */}
        <text x="553" y="158" fontSize="22" fill={world.pathColor} opacity="0.7" textAnchor="middle">▲</text>
        {/* Direction arrows on rows */}
        <text x="300" y="268" fontSize="18" fill={world.pathColor} opacity="0.5" textAnchor="middle">▶</text>
        <text x="300" y="60" fontSize="18" fill={world.pathColor} opacity="0.5" textAnchor="middle" transform="rotate(180 300 55)">▶</text>
      </svg>

      {/* Decorative emojis in interior */}
      <div className="board-interior">
        {world.decorativeEmojis.map((e, i) => (
          <span key={i} className="deco-emoji" style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
        ))}
      </div>

      {/* START tile */}
      <div
        className="start-tile"
        style={{ left: MARGIN, top: 2 * CELL + MARGIN, width: SQ, height: SQ }}
      >
        START
      </div>

      {/* Squares */}
      {PATH_LAYOUT.map((node, idx) => {
        if (node.type !== 'square' || node.squareNum === undefined) return null;
        const sq = world.squares[node.squareNum];
        const isVisited = idx <= pathIndex;
        const isCurrent = idx === pathIndex;
        return (
          <div
            key={idx}
            className={`square${isVisited ? ' visited' : ''}${isCurrent ? ' current' : ''}`}
            style={{
              left: node.col * CELL + MARGIN,
              top: node.row * CELL + MARGIN,
              width: SQ,
              height: SQ,
              background: COLOR_MAP[sq.color],
            }}
          >
            <span className="sq-number">{sq.squareNumber}</span>
            <span className="sq-emoji">{sq.emoji}</span>
          </div>
        );
      })}

      {/* Theme node */}
      <div
        className="theme-node"
        style={{
          left: MARGIN,
          top: MARGIN,
          width: SQ,
          height: SQ,
          background: world.pathColor,
        }}
      >
        <span className="theme-icon">{world.icon}</span>
        <span className="theme-label">{world.name}</span>
      </div>

      {/* Player piece */}
      <div
        className={`player-piece${noTransition ? ' no-transition' : ''}`}
        style={{
          left: pieceX,
          top: pieceY,
          borderColor: currentPlayer.color,
        }}
        title={currentPlayer.name}
      >
        <span>{currentPlayer.avatar}</span>
      </div>
    </div>
  );
}
