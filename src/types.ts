export type SquareColor = 'red' | 'yellow' | 'blue' | 'green';

export interface Square {
  squareNum: number;
  squareNumber: number;
  name: string;
  translation: string;
  emoji: string;
  color: SquareColor;
  videoUrl?: string;
}

export interface World {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  pathColor: string;
  backgroundColor: string;
  gradient: string;
  squareColorLight: string;
  squareColorDark: string;
  startSquareNumber: number;
  squares: Square[];
  decorativeEmojis: string[];
}

export type PathNodeType = 'start' | 'square' | 'connector' | 'theme';

export interface PathNode {
  col: number;
  row: number;
  type: PathNodeType;
  squareNum?: number;
}

export interface PiecePos {
  col: number;
  row: number;
}

export interface QuizQuestion {
  signName: string;
  signEmoji: string;
  options: string[];
  correctIndex: number;
}

export interface PlayerAnswer {
  optionIndex: number;
  timeMs: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQ: number;
  questionStartTime: number;
  answers: Record<string, PlayerAnswer | null>;
  sessionScores: Record<string, number>;
  showingResult: boolean;
}

export type GamePhase = 'rolling' | 'moving' | 'video' | 'quiz';

export type AppPhase =
  | 'intro'
  | 'mode-select'
  | 'player-setup'
  | 'room-lobby'
  | 'playing-local'
  | 'playing-online'
  | 'purchase';

export interface RoomState {
  code: string;
  players: Record<string, { name: string; avatar: string; color: string; score: number }>;
  playerOrder: string[];
  currentTurn: string;
  worldIndex: number;
  pathIndex: number;
  diceValue: number | null;
  phase: 'waiting' | 'rolling' | 'moving' | 'video' | 'quiz';
  quizQuestions: QuizQuestion[] | null;
  quizCurrentQ: number;
  quizQuestionStartTime: number;
  quizAnswers: Record<string, PlayerAnswer | null>;
  started: boolean;
}
