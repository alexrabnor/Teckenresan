import { useEffect, useCallback, useState } from 'react';
import type { Player, QuizState, PlayerAnswer } from '../types';
import QuizTimer from './QuizTimer';
import ScoreBoard from './ScoreBoard';

const QUIZ_DURATION = 15;
const STREAK_BONUSES: Record<number, number> = { 2: 20, 3: 40 };
const STREAK_BONUS_MAX = 80;

const STREAK_LABELS: Record<number, string> = {
  2: 'Bra serie!',
  3: 'Heta händer! 🔥',
  4: 'Oövervinnerlig! 👑',
};

interface Props {
  state: QuizState;
  setState: React.Dispatch<React.SetStateAction<QuizState | null>>;
  players: Player[];
  worldName: string;
  onComplete: (sessionScores: Record<string, number>) => void;
  onlineAnswer?: (optionIndex: number) => void;
  myPlayerId?: string;
  onToast?: (text: string, type?: 'success' | 'warning' | 'info') => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function streakBonus(streak: number): number {
  if (streak >= 4) return STREAK_BONUS_MAX;
  return STREAK_BONUSES[streak] ?? 0;
}

export default function QuizModal({
  state, setState, players, worldName, onComplete, onlineAnswer, myPlayerId, onToast,
}: Props) {
  const q = state.questions[state.currentQ];
  const isOnline = !!onlineAnswer && !!myPlayerId;
  // Per-player local streaks (only matters for local game; online streaks are simplified)
  const [streaks, setStreaks] = useState<Record<string, number>>(() =>
    Object.fromEntries(players.map(p => [p.id, state.streak ?? 0]))
  );

  const advanceQuestion = useCallback(() => {
    setState(prev => {
      if (!prev) return null;
      const correct = prev.questions[prev.currentQ].correctIndex;
      const newSessionScores = { ...prev.sessionScores };

      players.forEach(p => {
        const ans = prev.answers[p.id];
        if (ans && ans.optionIndex === correct) {
          const timeBonus = Math.max(0, 50 - Math.floor(ans.timeMs / 100));
          const streak = streaks[p.id] ?? 0;
          const sBonus = streakBonus(streak);
          const base = 100 + timeBonus + sBonus;
          newSessionScores[p.id] = (newSessionScores[p.id] ?? 0) + (prev.doublePoints ? base * 2 : base);
        }
      });

      return { ...prev, sessionScores: newSessionScores, showingResult: true };
    });
  }, [players, streaks]);

  // Auto-advance after showing result
  useEffect(() => {
    if (!state.showingResult) return;
    const t = setTimeout(() => {
      setState(prev => {
        if (!prev) return null;
        const nextQ = prev.currentQ + 1;
        if (nextQ >= prev.questions.length) {
          onComplete(prev.sessionScores);
          return null;
        }
        return {
          ...prev,
          currentQ: nextQ,
          questionStartTime: Date.now(),
          answers: Object.fromEntries(players.map(p => [p.id, null])),
          showingResult: false,
        };
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [state.showingResult]);

  const handleAnswer = useCallback((playerId: string, optionIndex: number) => {
    if (state.answers[playerId] !== null && state.answers[playerId] !== undefined) return;
    if (state.showingResult) return;

    const timeMs = Date.now() - state.questionStartTime;
    const isCorrect = optionIndex === q.correctIndex;

    // Update streak
    setStreaks(prev => {
      const newStreak = isCorrect ? (prev[playerId] ?? 0) + 1 : 0;
      const updated = { ...prev, [playerId]: newStreak };

      if (onToast) {
        if (isCorrect) {
          const msgs = ['Rätt! ✅', 'Snyggt jobbat! 🎉', 'Ja! Du kan det! 💪', 'Perfekt! ✨'];
          onToast(msgs[Math.floor(Math.random() * msgs.length)], 'success');
          const label = STREAK_LABELS[newStreak];
          if (label) onToast(label, 'success');
        } else {
          onToast('Sviten bruten! 💔', 'warning');
        }
      }
      return updated;
    });

    const newAnswers = { ...state.answers, [playerId]: { optionIndex, timeMs } as PlayerAnswer };

    if (isOnline && playerId === myPlayerId) {
      onlineAnswer!(optionIndex);
    }

    const allNow = players.every(p => newAnswers[p.id] !== null && newAnswers[p.id] !== undefined);
    setState(prev => {
      if (!prev) return null;
      return { ...prev, answers: newAnswers };
    });
    if (allNow) setTimeout(advanceQuestion, 300);
  }, [state, players, isOnline, myPlayerId, onlineAnswer, advanceQuestion, q, onToast]);

  const handleTimerExpire = useCallback(() => {
    if (!state.showingResult) advanceQuestion();
  }, [state.showingResult, advanceQuestion]);

  const layoutClass = players.length <= 2
    ? 'quiz-players-2'
    : players.length === 3
    ? 'quiz-players-3'
    : 'quiz-players-4';

  const duration = state.speedRound ? 8 : QUIZ_DURATION;

  // Render question area based on type
  const renderQuestion = () => {
    if (q.type === 'emoji-to-text') {
      return (
        <div className="quiz-question">
          <div className="quiz-type-label">Vilket tecken är detta?</div>
          <div className="quiz-sign-emoji">{q.signEmoji}</div>
        </div>
      );
    }
    if (q.type === 'text-to-emoji') {
      return (
        <div className="quiz-question">
          <div className="quiz-type-label">Vilket emoji är detta tecknet?</div>
          <div className="quiz-sign-word">{q.signName}</div>
        </div>
      );
    }
    // find-wrong
    return (
      <div className="quiz-question">
        <div className="quiz-type-label">Vilket par stämmer INTE?</div>
      </div>
    );
  };

  // Render options based on type
  const renderOptions = (player: Player) => {
    const answered = state.answers[player.id];
    const isMe = !isOnline || player.id === myPlayerId;
    const canAnswer = isMe && !answered && !state.showingResult;

    if (q.type === 'find-wrong' && q.pairs) {
      return (
        <div className="find-wrong-grid">
          {q.pairs.map((pair, idx) => {
            const isChosen = answered?.optionIndex === idx;
            const isCorrect = idx === q.correctIndex;
            let cls = 'find-wrong-pair';
            if (state.showingResult) {
              if (isCorrect) cls += ' correct';
              else if (isChosen) cls += ' wrong';
            } else if (isChosen) cls += ' chosen';

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => canAnswer && handleAnswer(player.id, idx)}
                disabled={!canAnswer}
              >
                <span className="fw-emoji">{pair.emoji}</span>
                <span className="fw-name">{pair.name}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="quiz-options">
        {q.options.map((opt, idx) => {
          const isChosen = answered?.optionIndex === idx;
          const isCorrect = idx === q.correctIndex;
          let btnClass = 'quiz-option-btn';
          if (state.showingResult) {
            if (isCorrect) btnClass += ' correct';
            else if (isChosen) btnClass += ' wrong';
          } else if (isChosen) {
            btnClass += ' chosen';
          }

          return (
            <button
              key={idx}
              className={btnClass}
              onClick={() => canAnswer && handleAnswer(player.id, idx)}
              disabled={!canAnswer}
              style={state.showingResult && isCorrect ? { borderColor: player.color } : undefined}
            >
              {q.type === 'text-to-emoji' ? (
                <span className="option-emoji">{opt}</span>
              ) : (
                <>
                  <span className="option-label">{OPTION_LABELS[idx]}</span>
                  <span className="option-text">{opt}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card quiz-modal">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-world-badge">{worldName} QUIZ!</div>
          <div className="quiz-progress">Fråga {state.currentQ + 1} / {state.questions.length}</div>
          {state.doublePoints && <div className="quiz-double-badge">✨ 2×</div>}
          {state.speedRound && <div className="quiz-speed-badge">⚡ Snabbomgång!</div>}
        </div>

        {renderQuestion()}

        <QuizTimer
          durationSec={duration}
          startTime={state.questionStartTime}
          onExpire={handleTimerExpire}
          paused={state.showingResult}
        />

        <div className={`quiz-players ${layoutClass}`}>
          {players.map(player => {
            const answered = state.answers[player.id];
            const playerStreak = streaks[player.id] ?? 0;

            return (
              <div
                key={player.id}
                className="quiz-player-panel"
                style={{ borderColor: player.color }}
              >
                <div className="quiz-player-header">
                  <span className="quiz-player-avatar">{player.avatar}</span>
                  <span className="quiz-player-name">{player.name}</span>
                  {answered && !state.showingResult && <span className="quiz-answered-badge">✓</span>}
                  {playerStreak >= 2 && (
                    <span className="quiz-streak-badge">🔥×{playerStreak}</span>
                  )}
                </div>

                {renderOptions(player)}

                {state.showingResult && answered && (
                  <div className={`quiz-result-badge ${answered.optionIndex === q.correctIndex ? 'right' : 'wrong'}`}>
                    {answered.optionIndex === q.correctIndex
                      ? `+${Math.round((100 + Math.max(0, 50 - Math.floor(answered.timeMs / 100)) + streakBonus(playerStreak)) * (state.doublePoints ? 2 : 1))} p`
                      : '0 p'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.values(state.sessionScores).some(s => s > 0) && (
          <ScoreBoard players={players} sessionScores={state.sessionScores} />
        )}
      </div>
    </div>
  );
}
