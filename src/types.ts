export type SquareColor = 'red' | 'yellow' | 'blue' | 'green';

export interface Square {
  squareNum: number;       // 0-9 index within world
  squareNumber: number;    // global display number (1-10 for W1, 11-20 for W2)
  name: string;            // Swedish word
  translation: string;     // English translation
  emoji: string;
  color: SquareColor;
}

export interface World {
  id: number;
  name: string;            // e.g. "DJUR"
  subtitle: string;        // e.g. "Djur"
  icon: string;
  pathColor: string;
  backgroundColor: string;
  startSquareNumber: number;
  squares: Square[];
  decorativeEmojis: string[];
}

export type PathNodeType = 'start' | 'square' | 'connector' | 'theme';

export interface PathNode {
  col: number;
  row: number;
  type: PathNodeType;
  squareNum?: number;      // index into world.squares (for type='square')
}

export type GamePhase =
  | 'intro'
  | 'rolling'
  | 'moving'
  | 'video'
  | 'quiz'
  | 'purchase';

export interface PiecePos {
  col: number;
  row: number;
}

export interface QuizQuestion {
  signName: string;
  signEmoji: string;
  correctAnswer: string;
  options: string[];
}
