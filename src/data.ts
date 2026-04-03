import type { World, PathNode, Square, SquareColor } from './types';

// Colors cycle: red, yellow, blue, green
const COLORS_W1: SquareColor[] = ['red', 'yellow', 'blue', 'green', 'red', 'yellow', 'blue', 'green', 'red', 'yellow'];
const COLORS_W2: SquareColor[] = ['blue', 'green', 'red', 'yellow', 'blue', 'green', 'red', 'yellow', 'blue', 'green'];

function makeSquares(
  data: Array<{ name: string; translation: string; emoji: string }>,
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
  }));
}

const world1Squares = makeSquares(
  [
    { name: 'HUND', translation: 'dog', emoji: '🐕' },
    { name: 'KATT', translation: 'cat', emoji: '🐱' },
    { name: 'BJÖRN', translation: 'bear', emoji: '🐻' },
    { name: 'HÄST', translation: 'horse', emoji: '🐴' },
    { name: 'FISK', translation: 'fish', emoji: '🐟' },
    { name: 'FÅGEL', translation: 'bird', emoji: '🐦' },
    { name: 'KO', translation: 'cow', emoji: '🐄' },
    { name: 'GRIS', translation: 'pig', emoji: '🐷' },
    { name: 'KANIN', translation: 'rabbit', emoji: '🐰' },
    { name: 'ORM', translation: 'snake', emoji: '🐍' },
  ],
  COLORS_W1,
  1,
);

const world2Squares = makeSquares(
  [
    { name: 'MAMMA', translation: 'mom', emoji: '👩' },
    { name: 'PAPPA', translation: 'dad', emoji: '👨' },
    { name: 'BARN', translation: 'child', emoji: '🧒' },
    { name: 'SYSTER', translation: 'sister', emoji: '👧' },
    { name: 'BROR', translation: 'brother', emoji: '👦' },
    { name: 'FARMOR', translation: 'grandma', emoji: '👵' },
    { name: 'FARFAR', translation: 'grandpa', emoji: '👴' },
    { name: 'FAMILJ', translation: 'family', emoji: '👨‍👩‍👧' },
    { name: 'BEBIS', translation: 'baby', emoji: '👶' },
    { name: 'FLICKA', translation: 'girl', emoji: '👧' },
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
    pathColor: '#66bb6a',
    backgroundColor: '#e8f5e9',
    startSquareNumber: 1,
    squares: world1Squares,
    decorativeEmojis: ['🐕', '🐱', '🐴', '🐟', '🦁'],
  },
  {
    id: 2,
    name: 'FAMILJ',
    subtitle: 'Familj',
    icon: '👨‍👩‍👧',
    pathColor: '#ec407a',
    backgroundColor: '#fce4ec',
    startSquareNumber: 11,
    squares: world2Squares,
    decorativeEmojis: ['👩', '👨', '🧒', '👧', '👦'],
  },
];

// The C-shaped path layout for each world (reused, but squareNum indexes into world.squares)
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

// Indices in PATH_LAYOUT that count as game steps (square + theme, not start/connector)
export const GAME_INDICES = PATH_LAYOUT
  .map((node, i) => ({ node, i }))
  .filter(({ node }) => node.type === 'square' || node.type === 'theme')
  .map(({ i }) => i);

// pathIndex of the start node
export const START_PATH_INDEX = 0;

// pathIndex of the theme node
export const THEME_PATH_INDEX = PATH_LAYOUT.findIndex(n => n.type === 'theme');
