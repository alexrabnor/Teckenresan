interface Props {
  value: number | null;
  isRolling: boolean;
}

const PIPS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

export default function Dice({ value, isRolling }: Props) {
  const display = value ?? 6;
  const pips = PIPS[display] ?? [];

  return (
    <div className={`dice${isRolling ? ' rolling' : ''}`}>
      <div className="dice-face">
        {pips.map(([r, c], i) => (
          <div
            key={i}
            className="pip"
            style={{
              gridRow: r + 1,
              gridColumn: c + 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
