import { useEffect, useState } from 'react';
import StarRating from './StarRating';

const MAX_SCORE = 1200; // 2 worlds × 4 questions × 150 pts
const HS_KEY = 'teckenresan_highscore';

function calcStars(score: number): 1 | 2 | 3 {
  const pct = score / MAX_SCORE;
  if (pct >= 0.8) return 3;
  if (pct >= 0.5) return 2;
  return 1;
}

function ptsToNextTier(score: number): number | null {
  const pct = score / MAX_SCORE;
  if (pct >= 0.8) return null;
  if (pct >= 0.5) return Math.ceil(MAX_SCORE * 0.8) - score;
  return Math.ceil(MAX_SCORE * 0.5) - score;
}

const MESSAGES: Record<1 | 2 | 3, string> = {
  3: 'Mästare! Du kan alla tecken! 🏆',
  2: 'Bra jobbat! Öva lite till! 💪',
  1: 'Bra start! Spela igen och förbättra dig! 🌱',
};

const LOCKED_WORLDS = [
  { name: 'MAT', icon: '🍕' },
  { name: 'VARDAG', icon: '🏠' },
  { name: 'FÄRGER', icon: '🎨' },
  { name: 'VECKODAGAR', icon: '📅' },
];

interface Props {
  totalScore: number;
  onRestart: () => void;
}

export default function ResultScreen({ totalScore, onRestart }: Props) {
  const stars = calcStars(totalScore);
  const missing = ptsToNextTier(totalScore);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const prev = parseInt(localStorage.getItem(HS_KEY) ?? '0', 10);
    if (totalScore > prev) {
      localStorage.setItem(HS_KEY, String(totalScore));
      setIsNewRecord(true);
    }
  }, [totalScore]);

  return (
    <div className="result-screen">
      <div className="result-content">
        <div className="result-trophy">🏅</div>

        {isNewRecord && (
          <div className="result-record-badge">NYTT REKORD! 🏆</div>
        )}

        <StarRating stars={stars} />

        <div className="result-score">{totalScore} <span className="result-score-label">poäng</span></div>

        <p className="result-message">{MESSAGES[stars]}</p>

        {missing !== null && missing <= 150 && (
          <p className="result-near-msg">
            Du saknade bara <strong>{missing} poäng</strong> för {stars + 1 === 2 ? '2' : '3'} stjärnor!
          </p>
        )}

        <button className="result-replay-btn" onClick={onRestart}>
          Spela igen →
        </button>

        <div className="result-unlock-section">
          <div className="result-unlock-title">Lär dig fler tecken</div>
          <div className="result-locked-worlds">
            {LOCKED_WORLDS.map(w => (
              <div key={w.name} className="result-locked-world">
                <span className="result-locked-icon">{w.icon}</span>
                <span className="result-locked-name">{w.name}</span>
                <span className="result-locked-padlock">🔒</span>
              </div>
            ))}
          </div>
          <button className="result-buy-btn">Köp hela spelet →</button>
        </div>
      </div>
    </div>
  );
}
