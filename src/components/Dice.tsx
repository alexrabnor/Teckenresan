interface Props {
  value: number | null;
  isRolling: boolean;
}

// Pip-positioner per sida (rad, kolumn) i ett 3x3 grid
const PIPS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

function DiceFace({ num }: { num: number }) {
  const pips = PIPS[num] ?? [];
  return (
    <div className="dice-face">
      {pips.map(([r, c], i) => (
        <div
          key={i}
          className="pip"
          style={{ gridRow: r + 1, gridColumn: c + 1 }}
        />
      ))}
    </div>
  );
}

export default function Dice({ value, isRolling }: Props) {
  const display = value ?? 1;
  const showClass = `show-${display}`;

  return (
    <div className="dice-3d-wrapper">
      <div className={`dice-3d ${showClass}${isRolling ? ' dice-rolling' : ''}`}>
        <div className="dice-face-3d face-1"><DiceFace num={1} /></div>
        <div className="dice-face-3d face-2"><DiceFace num={2} /></div>
        <div className="dice-face-3d face-3"><DiceFace num={3} /></div>
        <div className="dice-face-3d face-4"><DiceFace num={4} /></div>
        <div className="dice-face-3d face-5"><DiceFace num={5} /></div>
        <div className="dice-face-3d face-6"><DiceFace num={6} /></div>
      </div>
    </div>
  );
}
