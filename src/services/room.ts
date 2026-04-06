import { ref, set, get, onValue, update } from 'firebase/database';
import { db } from './firebase';
import type { RoomState, Player, PlayerAnswer } from '../types';

function getDb() {
  if (!db) throw new Error('Firebase not configured. Set up .env with Firebase credentials.');
  return db;
}

export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function createRoom(code: string, host: Player): Promise<void> {
  const d = getDb();
  const roomRef = ref(d, `rooms/${code}`);
  const initial: RoomState = {
    code,
    players: {
      [host.id]: { name: host.name, avatar: host.avatar, color: host.color, score: 0 },
    },
    playerOrder: [host.id],
    currentTurn: host.id,
    worldIndex: 0,
    pathIndex: 0,
    diceValue: null,
    phase: 'waiting',
    quizQuestions: null,
    quizCurrentQ: 0,
    quizQuestionStartTime: 0,
    quizAnswers: {},
    started: false,
  };
  await set(roomRef, initial);
}

export async function joinRoom(code: string, player: Player): Promise<RoomState | null> {
  const d = getDb();
  const roomRef = ref(d, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return null;
  const room = snap.val() as RoomState;
  if (room.started) return null;

  const updates: Record<string, unknown> = {};
  updates[`rooms/${code}/players/${player.id}`] = {
    name: player.name, avatar: player.avatar, color: player.color, score: 0,
  };
  updates[`rooms/${code}/playerOrder`] = [...(room.playerOrder || []), player.id];
  await update(ref(d), updates);
  return room;
}

export async function startRoom(code: string): Promise<void> {
  const d = getDb();
  await update(ref(d, `rooms/${code}`), { started: true, phase: 'rolling' });
}

export function listenRoom(code: string, cb: (r: RoomState) => void): () => void {
  const d = getDb();
  const roomRef = ref(d, `rooms/${code}`);
  const unsub = onValue(roomRef, snap => { if (snap.exists()) cb(snap.val() as RoomState); });
  return unsub;
}

export async function updateRoom(code: string, updates: Partial<RoomState>): Promise<void> {
  const d = getDb();
  await update(ref(d, `rooms/${code}`), updates);
}

export async function submitOnlineAnswer(
  code: string,
  playerId: string,
  answer: PlayerAnswer,
): Promise<void> {
  const d = getDb();
  await update(ref(d, `rooms/${code}/quizAnswers`), { [playerId]: answer });
}
