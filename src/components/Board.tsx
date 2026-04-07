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

// Väljer världsfärg per ruta baserat på jämn/udda squareNum
function squareColor(world: World, squareNum: number): string {
  return squareNum % 2 === 0 ? world.squareColorDark : world.squareColorLight;
}

export default function Board({ world, pathIndex, piecePos, currentPlayer, noTransition }: Props) {
  const pieceX = piecePos.col * CELL + CELL / 2 - 22;
  const pieceY = piecePos.row * CELL + CELL / 2 - 22;

  return (
    <div
      className="board"
      style={{
        width: BOARD_W,
        height: BOARD_H,
        maxWidth: '100%',
        background: world.backgroundColor,
      }}
    >
      {/* SVG path backdrop */}
      <svg
        className="board-svg"
        width="100%"
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0, maxWidth: '100%', display: 'block' }}
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
              background: squareColor(world, sq.squareNum),
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
