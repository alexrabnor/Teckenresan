import { useState, useEffect, useRef, useCallback } from 'react';
import type { Player, PiecePos, QuizQuestion, QuizState, RoomState } from './types';
import { WORLDS, PATH_LAYOUT, THEME_PATH_INDEX } from './data';
import { listenRoom, updateRoom, submitOnlineAnswer } from './services/room';
import Board from './components/Board';
import Panel from './components/Panel';
import VideoModal from './components/VideoModal';
import QuizModal from './components/QuizModal';
import { soundDice, soundMove } from './services/sounds';

function vibrate(pattern: number | number[]) {
  try { navigator.vibrate(pattern); } catch (e) {}
}

interface Props {
  roomCode: string;
  myPlayerId: string;
  myPlayer: Player;
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

export default function OnlineGame({ roomCode, myPlayerId, myPlayer, onComplete }: Props) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [piecePos, setPiecePos] = useState<PiecePos>({ col: 0, row: 2 });
  const [isRolling, setIsRolling] = useState(false);
  const [localDice, setLocalDice] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const isMovingRef = useRef(false);
  const prevPathIndexRef = useRef(0);

  const isMyTurn = room?.currentTurn === myPlayerId;
  const worldIndex = room?.worldIndex ?? 0;
  const currentWorld = WORLDS[worldIndex];

  // Listen to room changes
  useEffect(() => {
    const unsub = listenRoom(roomCode, r => setRoom(r));
    return unsub;
  }, [roomCode]);

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
        soundMove();
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
    });
  }, [room?.phase, room?.quizCurrentQ, room?.quizQuestionStartTime]);

  const handleRoll = useCallback(async () => {
    if (!room || !isMyTurn || room.phase !== 'rolling' || isMovingRef.current) return;
    isMovingRef.current = true;
    setIsRolling(true);
    vibrate(50);
    soundDice();

    // Animera tärningen (rullar i 800ms, visar slumpmässiga 1-3)
    const rollDuration = 800;
    const startTime = Date.now();
    while (Date.now() - startTime < rollDuration) {
      setLocalDice(Math.ceil(Math.random() * 3));
      await sleep(80);
    }
    const rolled = Math.ceil(Math.random() * 3);
    setLocalDice(rolled);
    setIsRolling(false);
    // Visa resultatet i 1.5 sek innan brickan börjar röra sig
    await sleep(1500);

    // Calculate target
    let stepsLeft = rolled;
    let target = room.pathIndex;
    while (stepsLeft > 0 && target < THEME_PATH_INDEX) {
      target++;
      if (PATH_LAYOUT[target].type !== 'connector') stepsLeft--;
    }

    await updateRoom(roomCode, { diceValue: rolled, phase: 'moving', pathIndex: target });

    await sleep(target - room.pathIndex * 350 + 600);

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

  const handleQuizComplete = async (_scores: Record<string, number>) => {
    if (!room) return;
    const nextWorld = worldIndex + 1;
    if (nextWorld >= WORLDS.length) {
      onComplete();
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
        <Board
          world={currentWorld}
          pathIndex={room.pathIndex}
          piecePos={piecePos}
          currentPlayer={currentPlayer}
          isMoving={room.phase === 'moving'}
          noTransition={false}
        />
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
        />
      )}
    </div>
  );
}
