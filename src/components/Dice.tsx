interface Props {
  value: number | null;
  isRolling: boolean;
}

// Pip-positioner i ett 3×3 grid för siffra 1–3
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
};

function DiceFace({ num, label }: { num: number; label?: string }) {
  const pips = PIPS[num] ?? PIPS[1];
  return (
    <div className="d3-face-inner">
      {label && <span className="d3-face-label">{label}</span>}
      <div className="d3-pips-grid">
        {pips.map(([r, c], i) => (
          <div
            key={i}
            className="d3-pip"
            style={{ gridRow: r + 1, gridColumn: c + 1 }}
          />
        ))}
      </div>
    </div>
  );
}

// Vilken rotation visar vilken face framåt
// front=1, right=2, top=3, left=2, bottom=1, back=3
const SHOW_TRANSFORM: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(0deg) rotateY(-90deg)',
  3: 'rotateX(90deg) rotateY(0deg)',
};

export default function Dice({ value, isRolling }: Props) {
  const display = value ?? 1;
  const cubeTransform = isRolling ? undefined : SHOW_TRANSFORM[display] ?? SHOW_TRANSFORM[1];

  return (
    <div className="d3-wrapper">
      <div
        className={`d3-cube${isRolling ? ' d3-rolling' : ' d3-settled'}`}
        style={!isRolling ? { transform: cubeTransform } : undefined}
      >
        {/* front  → visar 1 */}
        <div className="d3-face d3-face-front">
          <DiceFace num={1} />
        </div>
        {/* right  → visar 2 */}
        <div className="d3-face d3-face-right">
          <DiceFace num={2} />
        </div>
        {/* top    → visar 3 */}
        <div className="d3-face d3-face-top">
          <DiceFace num={3} />
        </div>
        {/* left   → visar 2 */}
        <div className="d3-face d3-face-left">
          <DiceFace num={2} />
        </div>
        {/* bottom → visar 1 */}
        <div className="d3-face d3-face-bottom">
          <DiceFace num={1} />
        </div>
        {/* back   → visar 3 */}
        <div className="d3-face d3-face-back">
          <DiceFace num={3} />
        </div>
      </div>

      {/* Visa siffra tydligt under tärningen när den landat */}
      {!isRolling && value !== null && (
        <div className="d3-result-label">
          {value}
        </div>
      )}
    </div>
  );
}
