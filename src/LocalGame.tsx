import { useState, useRef, useCallback } from 'react';
import type { Player, GamePhase, PiecePos, QuizState, QuizQuestion } from './types';
import { WORLDS, PATH_LAYOUT, THEME_PATH_INDEX } from './data';
import Board from './components/Board';
import Panel from './components/Panel';
import VideoModal from './components/VideoModal';
import QuizModal from './components/QuizModal';

interface Props {
  players: Player[];
  onComplete: () => void;
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function generateQuiz(worldIndex: number): QuizQuestion[] {
  const world = WORLDS[worldIndex];
  const shuffled = [...world.squares].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  return selected.map(sq => {
    const correct = sq.name;
    const wrong = world.squares
      .filter(s => s.squareNum !== sq.squareNum)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(s => s.name);
    const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
    return { signName: sq.name, signEmoji: sq.emoji, options, correctIndex: options.indexOf(correct) };
  });
}

export default function LocalGame({ players: initialPlayers, onComplete }: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [worldIndex, setWorldIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  const [piecePos, setPiecePos] = useState<PiecePos>({ col: 0, row: 2 });
  const [gamePhase, setGamePhase] = useState<GamePhase>('rolling');
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [landedSquareIdx, setLandedSquareIdx] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const isMovingRef = useRef(false);
  const noTransitionRef = useRef(false);

  const currentWorld = WORLDS[worldIndex];
  const currentPlayer = players[currentPlayerIndex];

  const handleRoll = useCallback(async () => {
    if (gamePhase !== 'rolling' || isMovingRef.current) return;
    isMovingRef.current = true;
    setIsRolling(true);

    // Animate dice
    for (let i = 0; i < 10; i++) {
      setDiceValue(Math.ceil(Math.random() * 6));
      await sleep(60);
    }
    const rolled = Math.ceil(Math.random() * 6);
    setDiceValue(rolled);
    setIsRolling(false);
    await sleep(500);

    setGamePhase('moving');

    // Find target path index (count only squares + theme, skip connector)
    let stepsLeft = rolled;
    let target = pathIndex;
    while (stepsLeft > 0 && target < THEME_PATH_INDEX) {
      target++;
      const node = PATH_LAYOUT[target];
      if (node.type !== 'connector') stepsLeft--;
    }

    // Animate piece through every position
    for (let i = pathIndex + 1; i <= target; i++) {
      const node = PATH_LAYOUT[i];
      setPiecePos({ col: node.col, row: node.row });
      await sleep(350);
    }
    setPathIndex(target);

    const landed = PATH_LAYOUT[target];
    if (landed.type === 'theme') {
      const questions = generateQuiz(worldIndex);
      setQuizState({
        questions,
        currentQ: 0,
        questionStartTime: Date.now(),
        answers: Object.fromEntries(players.map(p => [p.id, null])),
        sessionScores: Object.fromEntries(players.map(p => [p.id, 0])),
        showingResult: false,
      });
      setGamePhase('quiz');
    } else if (landed.type === 'square' && landed.squareNum !== undefined) {
      setLandedSquareIdx(landed.squareNum);
      setGamePhase('video');
    } else {
      setGamePhase('rolling');
    }
    isMovingRef.current = false;
  }, [gamePhase, pathIndex, worldIndex, players]);

  const handleCloseVideo = () => {
    setLandedSquareIdx(null);
    // Advance to next player
    setCurrentPlayerIndex(i => (i + 1) % players.length);
    setGamePhase('rolling');
  };

  const handleQuizComplete = (finalSessionScores: Record<string, number>) => {
    // Add quiz scores to player totals
    setPlayers(prev => prev.map(p => ({
      ...p,
      score: p.score + (finalSessionScores[p.id] ?? 0),
    })));

    const nextWorld = worldIndex + 1;
    if (nextWorld >= WORLDS.length) {
      onComplete();
    } else {
      // Reset board for next world
      noTransitionRef.current = true;
      setWorldIndex(nextWorld);
      setPathIndex(0);
      setPiecePos({ col: 0, row: 2 });
      setCurrentPlayerIndex(0);
      setDiceValue(null);
      setQuizState(null);
      setGamePhase('rolling');
      setTimeout(() => { noTransitionRef.current = false; }, 50);
    }
  };

  const landedSquare = landedSquareIdx !== null ? currentWorld.squares[landedSquareIdx] : null;
  const stepsToTheme = (() => {
    let count = 0;
    for (let i = pathIndex + 1; i < PATH_LAYOUT.length; i++) {
      if (PATH_LAYOUT[i].type !== 'connector') count++;
    }
    return count;
  })();

  const currentSquareNumber = (() => {
    const node = PATH_LAYOUT[pathIndex];
    if (node.type === 'start') return 0;
    if (node.type === 'theme') return currentWorld.squares.length + currentWorld.startSquareNumber;
    if (node.squareNum !== undefined) return currentWorld.startSquareNumber + node.squareNum;
    return 0;
  })();

  return (
    <div className="game-root">
      <div className="game-layout">
        <Board
          world={currentWorld}
          pathIndex={pathIndex}
          piecePos={piecePos}
          currentPlayer={currentPlayer}
          isMoving={gamePhase === 'moving'}
          noTransition={noTransitionRef.current}
        />
        <Panel
          world={currentWorld}
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          squareNumber={currentSquareNumber}
          diceValue={diceValue}
          isRolling={isRolling}
          stepsToTheme={stepsToTheme}
          canRoll={gamePhase === 'rolling'}
          nextWorldName={WORLDS[worldIndex + 1]?.name}
          onRoll={handleRoll}
        />
      </div>

      {gamePhase === 'video' && landedSquare && (
        <VideoModal square={landedSquare} playerName={currentPlayer.name} onClose={handleCloseVideo} />
      )}

      {gamePhase === 'quiz' && quizState && (
        <QuizModal
          state={quizState}
          setState={setQuizState}
          players={players}
          worldName={currentWorld.name}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
