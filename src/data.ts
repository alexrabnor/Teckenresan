import type { World, PathNode, Square, SquareColor } from './types';

// Colors cycle (behålls i typen men används ej för display längre)
const COLORS_W1: SquareColor[] = ['red', 'yellow', 'blue', 'green', 'red', 'yellow', 'blue', 'green', 'red', 'yellow'];
const COLORS_W2: SquareColor[] = ['blue', 'green', 'red', 'yellow', 'blue', 'green', 'red', 'yellow', 'blue', 'green'];

function makeSquares(
  data: Array<{ name: string; translation: string; emoji: string; videoUrl?: string }>,
  colors: SquareColor[],
  startSquareNumber: number,
): Square[] {
  return data.map((d, i) => ({
    squareNum: i,
    squareNumber: startSquareNumber + i,
    name: d.name,
    translation: d.translation,
    emoji: d.emoji,
    color: colors[i],
    videoUrl: d.videoUrl ?? '',
  }));
}

const world1Squares = makeSquares(
  [
    { name: 'HUND',  translation: 'dog',    emoji: '🐕', videoUrl: '' },
    { name: 'KATT',  translation: 'cat',    emoji: '🐱', videoUrl: '' },
    { name: 'BJÖRN', translation: 'bear',   emoji: '🐻', videoUrl: '' },
    { name: 'HÄST',  translation: 'horse',  emoji: '🐴', videoUrl: '' },
    { name: 'FISK',  translation: 'fish',   emoji: '🐟', videoUrl: '' },
    { name: 'FÅGEL', translation: 'bird',   emoji: '🐦', videoUrl: '' },
    { name: 'KO',    translation: 'cow',    emoji: '🐄', videoUrl: '' },
    { name: 'GRIS',  translation: 'pig',    emoji: '🐷', videoUrl: '' },
    { name: 'KANIN', translation: 'rabbit', emoji: '🐰', videoUrl: '' },
    { name: 'ORM',   translation: 'snake',  emoji: '🐍', videoUrl: '' },
  ],
  COLORS_W1,
  1,
);

const world2Squares = makeSquares(
  [
    { name: 'MAMMA',  translation: 'mom',       emoji: '👩',       videoUrl: '' },
    { name: 'PAPPA',  translation: 'dad',        emoji: '👨',       videoUrl: '' },
    { name: 'BARN',   translation: 'child',      emoji: '🧒',       videoUrl: '' },
    { name: 'SYSTER', translation: 'sister',     emoji: '👧',       videoUrl: '' },
    { name: 'BROR',   translation: 'brother',    emoji: '👦',       videoUrl: '' },
    { name: 'FARMOR', translation: 'grandma',    emoji: '👵',       videoUrl: '' },
    { name: 'FARFAR', translation: 'grandpa',    emoji: '👴',       videoUrl: '' },
    { name: 'FAMILJ', translation: 'family',     emoji: '👨‍👩‍👧',     videoUrl: '' },
    { name: 'BEBIS',  translation: 'baby',       emoji: '👶',       videoUrl: '' },
    { name: 'FLICKA', translation: 'girl',       emoji: '👧',       videoUrl: '' },
  ],
  COLORS_W2,
  11,
);

export const WORLDS: World[] = [
  {
    id: 1,
    name: 'DJUR',
    subtitle: 'Djur',
    icon: '🐻',
    pathColor: '#4caf50',
    backgroundColor: '#e8f5e9',
    gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
    squareColorLight: '#a5d6a7',   // grön 200
    squareColorDark:  '#388e3c',   // grön 700
    startSquareNumber: 1,
    squares: world1Squares,
    decorativeEmojis: ['🐕', '🐱', '🐴', '🐟', '🦁'],
  },
  {
    id: 2,
    name: 'FAMILJ',
    subtitle: 'Familj',
    icon: '👨‍👩‍👧',
    pathColor: '#1e88e5',
    backgroundColor: '#e3f2fd',
    gradient: 'linear-gradient(135deg, #1565c0, #64b5f6)',
    squareColorLight: '#90caf9',   // blå 200
    squareColorDark:  '#1565c0',   // blå 800
    startSquareNumber: 11,
    squares: world2Squares,
    decorativeEmojis: ['👩', '👨', '🧒', '👧', '👦'],
  },
];

// The C-shaped path layout for each world (reused, squareNum indexes into world.squares)
export const PATH_LAYOUT: PathNode[] = [
  { col: 0, row: 2, type: 'start' },
  { col: 1, row: 2, type: 'square', squareNum: 0 },
  { col: 2, row: 2, type: 'square', squareNum: 1 },
  { col: 3, row: 2, type: 'square', squareNum: 2 },
  { col: 4, row: 2, type: 'square', squareNum: 3 },
  { col: 5, row: 2, type: 'square', squareNum: 4 },
  { col: 5, row: 1, type: 'connector' },
  { col: 5, row: 0, type: 'square', squareNum: 5 },
  { col: 4, row: 0, type: 'square', squareNum: 6 },
  { col: 3, row: 0, type: 'square', squareNum: 7 },
  { col: 2, row: 0, type: 'square', squareNum: 8 },
  { col: 1, row: 0, type: 'square', squareNum: 9 },
  { col: 0, row: 0, type: 'theme' },
];

export const GAME_INDICES = PATH_LAYOUT
  .map((node, i) => ({ node, i }))
  .filter(({ node }) => node.type === 'square' || node.type === 'theme')
  .map(({ i }) => i);

export const START_PATH_INDEX = 0;
export const THEME_PATH_INDEX = PATH_LAYOUT.findIndex(n => n.type === 'theme');
