import { useEffect, useState } from 'react';

interface Props {
  durationSec: number;
  startTime: number;
  onExpire: () => void;
  paused?: boolean;
}

export default function QuizTimer({ durationSec, startTime, onExpire, paused }: Props) {
  const [timeLeft, setTimeLeft] = useState(durationSec);

  useEffect(() => {
    if (paused) return;
    setTimeLeft(durationSec);

    const id = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const left = Math.max(0, durationSec - elapsed);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) {
        clearInterval(id);
        onExpire();
      }
    }, 200);

    return () => clearInterval(id);
  }, [startTime, durationSec, paused]);

  const pct = (timeLeft / durationSec) * 100;
  const color = timeLeft > 8 ? '#43a047' : timeLeft > 4 ? '#fdd835' : '#e53935';

  return (
    <div className="quiz-timer">
      <div className="quiz-timer-bar-bg">
        <div
          className="quiz-timer-bar"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.2s linear, background 0.5s' }}
        />
      </div>
      <div className="quiz-timer-text" style={{ color }}>{timeLeft}s</div>
    </div>
  );
}
