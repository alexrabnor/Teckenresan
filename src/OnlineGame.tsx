import { useState, useEffect, useRef, useCallback } from 'react';
import type { Player, PiecePos, QuizState, RoomState, ToastMessage } from './types';
import { WORLDS, PATH_LAYOUT, THEME_PATH_INDEX } from './data';
import { listenRoom, updateRoom, submitOnlineAnswer } from './services/room';
import { generateQuiz } from './quiz';
import Board from './components/Board';
import Panel from './components/Panel';
import VideoModal from './components/VideoModal';
import QuizModal from './components/QuizModal';
import Toast from './components/Toast';

interface Props {
  roomCode: string;
  myPlayerId: string;
  myPlayer: Player;
  onComplete: (totalScore: number) => void;
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

let toastCounter = 0;
function makeToastId() { return `t${++toastCounter}`; }

export default function OnlineGame({ roomCode, myPlayerId, myPlayer, onComplete }: Props) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [piecePos, setPiecePos] = useState<PiecePos>({ col: 0, row: 2 });
  const [isRolling, setIsRolling] = useState(false);
  const [localDice, setLocalDice] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const isMovingRef = useRef(false);
  const prevPathIndexRef = useRef(0);
  const prevRankRef = useRef<number | null>(null);

  const isMyTurn = room?.currentTurn === myPlayerId;
  const worldIndex = room?.worldIndex ?? 0;
  const currentWorld = WORLDS[worldIndex];

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    setToasts(prev => [...prev, { id: makeToastId(), text, type, duration: 2500 }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Listen to room changes
  useEffect(() => {
    const unsub = listenRoom(roomCode, r => setRoom(r));
    return unsub;
  }, [roomCode]);

  // Detect position changes (lead taken/lost)
  useEffect(() => {
    if (!room) return;
    const playerOrder = room.playerOrder ?? [];
    const sorted = [...playerOrder].sort((a, b) => (room.players[b]?.score ?? 0) - (room.players[a]?.score ?? 0));
    const myRank = sorted.indexOf(myPlayerId);
    if (prevRankRef.current !== null && myRank !== prevRankRef.current) {
      if (myRank === 0 && prevRankRef.current > 0) {
        addToast('Du leder! 🔥', 'success');
      } else if (prevRankRef.current === 0 && myRank > 0) {
        addToast('Du tappar ledningen! 😬', 'warning');
      }
    }
    prevRankRef.current = myRank;
  }, [room?.players, myPlayerId, addToast]);

  // Animate piece when pathIndex changes
  useEffect(() => {
    if (!room) return;
    const from = prevPathIndexRef.current;
    const to = room.pathIndex;
    if (from === to) return;
    prevPathIndexRef.current = to;

    let cancelled = false;
    (async () => {
      for (let i = from + 1; i <= to; i++) {
        if (cancelled) break;
        const node = PATH_LAYOUT[i];
        setPiecePos({ col: node.col, row: node.row });
        await sleep(350);
      }
    })();
    return () => { cancelled = true; };
  }, [room?.pathIndex]);

  // Build quiz state from room when phase === 'quiz'
  useEffect(() => {
    if (!room || room.phase !== 'quiz' || !room.quizQuestions) return;
    setQuizState({
      questions: room.quizQuestions,
      currentQ: room.quizCurrentQ,
      questionStartTime: room.quizQuestionStartTime,
      answers: room.quizAnswers ?? {},
      sessionScores: {},
      showingResult: false,
      streak: 0,
      bestStreak: 0,
      doublePoints: false,
      speedRound: false,
    });
  }, [room?.phase, room?.quizCurrentQ, room?.quizQuestionStartTime]);

  const handleRoll = useCallback(async () => {
    if (!room || !isMyTurn || room.phase !== 'rolling' || isMovingRef.current) return;
    isMovingRef.current = true;
    setIsRolling(true);

    for (let i = 0; i < 10; i++) {
      setLocalDice(Math.ceil(Math.random() * 6));
      await sleep(60);
    }
    const rolled = Math.ceil(Math.random() * 6);
    setLocalDice(rolled);
    setIsRolling(false);
    await sleep(500);

    let stepsLeft = rolled;
    let target = room.pathIndex;
    while (stepsLeft > 0 && target < THEME_PATH_INDEX) {
      target++;
      if (PATH_LAYOUT[target].type !== 'connector') stepsLeft--;
    }

    await updateRoom(roomCode, { diceValue: rolled, phase: 'moving', pathIndex: target });
    await sleep((target - room.pathIndex) * 350 + 600);

    const landed = PATH_LAYOUT[target];
    if (landed.type === 'theme') {
      const questions = generateQuiz(worldIndex);
      await updateRoom(roomCode, {
        phase: 'quiz',
        quizQuestions: questions,
        quizCurrentQ: 0,
        quizQuestionStartTime: Date.now(),
        quizAnswers: {},
      });
    } else {
      await updateRoom(roomCode, { phase: 'video' });
    }

    isMovingRef.current = false;
  }, [room, isMyTurn, roomCode, worldIndex]);

  const handleCloseVideo = async () => {
    if (!room) return;
    const playerOrder = room.playerOrder;
    const currentIdx = playerOrder.indexOf(room.currentTurn);
    const nextTurn = playerOrder[(currentIdx + 1) % playerOrder.length];
    await updateRoom(roomCode, { phase: 'rolling', currentTurn: nextTurn });
  };

  const handleOnlineAnswer = async (optionIndex: number) => {
    await submitOnlineAnswer(roomCode, myPlayerId, {
      optionIndex,
      timeMs: Date.now() - (room?.quizQuestionStartTime ?? Date.now()),
    });
  };

  const handleQuizComplete = async (scores: Record<string, number>) => {
    if (!room) return;
    const nextWorld = worldIndex + 1;
    if (nextWorld >= WORLDS.length) {
      const myScore = (room.players[myPlayerId]?.score ?? 0) + (scores[myPlayerId] ?? 0);
      onComplete(myScore);
    } else {
      await updateRoom(roomCode, {
        worldIndex: nextWorld,
        pathIndex: 0,
        phase: 'rolling',
        quizQuestions: null,
        quizAnswers: {},
        currentTurn: room.playerOrder[0],
      });
      prevPathIndexRef.current = 0;
      setPiecePos({ col: 0, row: 2 });
    }
  };

  if (!room) return <div className="loading">Ansluter...</div>;

  const players: Player[] = (room.playerOrder ?? []).map(uid => ({
    id: uid,
    name: room.players[uid]?.name ?? uid,
    avatar: room.players[uid]?.avatar ?? '🧍',
    color: room.players[uid]?.color ?? '#1e88e5',
    score: room.players[uid]?.score ?? 0,
  }));

  const currentPlayerIndex = room.playerOrder.indexOf(room.currentTurn);
  const currentPlayer = players[currentPlayerIndex] ?? myPlayer;

  const landedNode = room.phase === 'video' ? PATH_LAYOUT[room.pathIndex] : null;
  const landedSquare = landedNode?.type === 'square' && landedNode.squareNum !== undefined
    ? currentWorld.squares[landedNode.squareNum]
    : null;

  const stepsToTheme = (() => {
    let count = 0;
    for (let i = room.pathIndex + 1; i < PATH_LAYOUT.length; i++) {
      if (PATH_LAYOUT[i].type !== 'connector') count++;
    }
    return count;
  })();

  const currentSquareNumber = (() => {
    const node = PATH_LAYOUT[room.pathIndex];
    if (node.type === 'start') return 0;
    if (node.squareNum !== undefined) return currentWorld.startSquareNumber + node.squareNum;
    return 0;
  })();

  return (
    <div className="game-root">
      <div className="online-badge">Rumskod: <strong>{roomCode}</strong></div>
      <div className="game-layout">
        <div className="board-scaler">
          <Board
            world={currentWorld}
            pathIndex={room.pathIndex}
            piecePos={piecePos}
            currentPlayer={currentPlayer}
            isMoving={room.phase === 'moving'}
            noTransition={false}
          />
        </div>
        <Panel
          world={currentWorld}
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          squareNumber={currentSquareNumber}
          diceValue={localDice ?? room.diceValue}
          isRolling={isRolling}
          stepsToTheme={stepsToTheme}
          canRoll={isMyTurn && room.phase === 'rolling'}
          nextWorldName={WORLDS[worldIndex + 1]?.name}
          onRoll={handleRoll}
        />
      </div>

      {room.phase === 'video' && landedSquare && (
        <VideoModal
          square={landedSquare}
          playerName={currentPlayer.name}
          onClose={isMyTurn ? handleCloseVideo : undefined}
        />
      )}

      {room.phase === 'quiz' && quizState && (
        <QuizModal
          state={quizState}
          setState={setQuizState}
          players={players}
          worldName={currentWorld.name}
          onComplete={handleQuizComplete}
          onlineAnswer={handleOnlineAnswer}
          myPlayerId={myPlayerId}
          onToast={addToast}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
