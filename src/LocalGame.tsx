import { useState, useRef, useCallback } from 'react';
import type { Player, GamePhase, PiecePos, QuizState, BoardEvent, ToastMessage } from './types';
import { WORLDS, PATH_LAYOUT, THEME_PATH_INDEX } from './data';
import { generateQuiz } from './quiz';
import Board from './components/Board';
import Panel from './components/Panel';
import VideoModal from './components/VideoModal';
import QuizModal from './components/QuizModal';
import EventModal from './components/EventModal';
import Toast from './components/Toast';

interface Props {
  players: Player[];
  onComplete: (totalScore: number) => void;
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const BOARD_EVENTS: BoardEvent[] = [
  { type: 'BONUS', label: 'Blixttur!', emoji: '⚡', description: 'Hoppa ett extra steg framåt!' },
  { type: 'TRAP', label: 'Storm!', emoji: '🌪', description: 'Backa ett steg...' },
  { type: 'SPEED_ROUND', label: 'Snabbomgång!', emoji: '⏱', description: 'Halva tiden i quizet!' },
  { type: 'DOUBLE_POINTS', label: 'Dubbla poäng!', emoji: '✨', description: 'Alla poäng dubblas i quizet!' },
];

const LUCKY_MESSAGES = ['Turslagen! 🍀', 'Vilken tur du har! 🌟', 'Bra slag! 💫'];

let toastCounter = 0;
function makeToastId() { return `t${++toastCounter}`; }

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
  const [pendingEvent, setPendingEvent] = useState<BoardEvent | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const isMovingRef = useRef(false);
  const noTransitionRef = useRef(false);
  // Store event resolution callback
  const eventResolveRef = useRef<(() => void) | null>(null);

  const currentWorld = WORLDS[worldIndex];
  const currentPlayer = players[currentPlayerIndex];

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info', duration = 2000) => {
    setToasts(prev => [...prev, { id: makeToastId(), text, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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

    // Rare lucky message (1 in 8 chance)
    if (Math.random() < 0.125) {
      addToast(LUCKY_MESSAGES[Math.floor(Math.random() * LUCKY_MESSAGES.length)], 'info');
    }

    await sleep(500);
    setGamePhase('moving');

    // 15% chance of a board event
    let eventBonus = 0;
    let speedRound = false;
    let doublePoints = false;

    if (Math.random() < 0.15) {
      const ev = BOARD_EVENTS[Math.floor(Math.random() * BOARD_EVENTS.length)];
      // Show event modal and wait for it
      await new Promise<void>(resolve => {
        eventResolveRef.current = resolve;
        setPendingEvent(ev);
      });
      setPendingEvent(null);

      if (ev.type === 'BONUS') eventBonus = 1;
      if (ev.type === 'TRAP') eventBonus = -1;
      if (ev.type === 'SPEED_ROUND') speedRound = true;
      if (ev.type === 'DOUBLE_POINTS') doublePoints = true;
    }

    // Find target path index
    let stepsLeft = rolled;
    let target = pathIndex;
    while (stepsLeft > 0 && target < THEME_PATH_INDEX) {
      target++;
      if (PATH_LAYOUT[target].type !== 'connector') stepsLeft--;
    }

    // Apply event bonus/trap
    if (eventBonus !== 0) {
      let adjusted = target;
      if (eventBonus > 0 && adjusted < THEME_PATH_INDEX) {
        adjusted++;
        if (PATH_LAYOUT[adjusted].type === 'connector') adjusted++;
      } else if (eventBonus < 0 && adjusted > pathIndex) {
        adjusted--;
        if (PATH_LAYOUT[adjusted]?.type === 'connector') adjusted--;
      }
      target = Math.max(pathIndex, Math.min(THEME_PATH_INDEX, adjusted));
    }

    // Landing near theme toast (pathIndex 11 = last square before theme)
    if (target === 11) {
      addToast('Temat är nära! 🎯', 'info');
    }

    // Animate piece
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
        streak: 0,
        bestStreak: 0,
        doublePoints,
        speedRound,
      });
      setGamePhase('quiz');
    } else if (landed.type === 'square' && landed.squareNum !== undefined) {
      setLandedSquareIdx(landed.squareNum);
      setGamePhase('video');
    } else {
      setGamePhase('rolling');
    }
    isMovingRef.current = false;
  }, [gamePhase, pathIndex, worldIndex, players, addToast]);

  const handleEventComplete = useCallback(() => {
    if (eventResolveRef.current) {
      eventResolveRef.current();
      eventResolveRef.current = null;
    }
  }, []);

  const handleCloseVideo = () => {
    setLandedSquareIdx(null);
    setCurrentPlayerIndex(i => (i + 1) % players.length);
    setGamePhase('rolling');
  };

  const handleQuizComplete = (finalSessionScores: Record<string, number>) => {
    const updatedPlayers = players.map(p => ({
      ...p,
      score: p.score + (finalSessionScores[p.id] ?? 0),
    }));
    setPlayers(updatedPlayers);

    const nextWorld = worldIndex + 1;
    if (nextWorld >= WORLDS.length) {
      const total = updatedPlayers.reduce((sum, p) => sum + p.score, 0);
      onComplete(total);
    } else {
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
        <div className="board-scaler">
          <Board
            world={currentWorld}
            pathIndex={pathIndex}
            piecePos={piecePos}
            currentPlayer={currentPlayer}
            isMoving={gamePhase === 'moving'}
            noTransition={noTransitionRef.current}
          />
        </div>
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

      {pendingEvent && (
        <EventModal event={pendingEvent} onComplete={handleEventComplete} />
      )}

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
          onToast={addToast}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
