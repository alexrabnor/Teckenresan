import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { Player, QuizState, PlayerAnswer } from '../types';
import QuizTimer from './QuizTimer';
import ScoreBoard from './ScoreBoard';
import { soundCorrect, soundWrong } from '../services/sounds';

const QUIZ_DURATION = 15;

interface Props {
  state: QuizState;
  setState: React.Dispatch<React.SetStateAction<QuizState | null>>;
  players: Player[];
  worldName: string;
  onComplete: (sessionScores: Record<string, number>) => void;
  onlineAnswer?: (optionIndex: number) => void;
  myPlayerId?: string;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizModal({
  state, setState, players, worldName, onComplete, onlineAnswer, myPlayerId,
}: Props) {
  const q = state.questions[state.currentQ];
  const isOnline = !!onlineAnswer && !!myPlayerId;

  const advanceQuestion = useCallback(() => {
    setState(prev => {
      if (!prev) return null;

      // Beräkna poäng för denna fråga
      const correct = prev.questions[prev.currentQ].correctIndex;
      const newSessionScores = { ...prev.sessionScores };

      players.forEach(p => {
        const ans = prev.answers[p.id];
        if (ans && ans.optionIndex === correct) {
          const bonus = Math.max(0, 50 - Math.floor(ans.timeMs / 100));
          newSessionScores[p.id] = (newSessionScores[p.id] ?? 0) + 100 + bonus;
        }
      });

      return { ...prev, sessionScores: newSessionScores, showingResult: true };
    });
  }, [players]);

  // Visa resultat-effekter när svar visas
  useEffect(() => {
    if (!state.showingResult) return;

    const correct = state.questions[state.currentQ].correctIndex;
    // Kolla om någon spelare svarade rätt
    const anyCorrect = players.some(p => {
      const ans = state.answers[p.id];
      return ans && ans.optionIndex === correct;
    });

    if (anyCorrect) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      soundCorrect();
    } else {
      soundWrong();
    }
  }, [state.showingResult]);

  // Auto-advance efter att ha visat resultat
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
    }, 2500);
    return () => clearTimeout(t);
  }, [state.showingResult]);

  const handleAnswer = useCallback((playerId: string, optionIndex: number) => {
    if (state.answers[playerId] !== null && state.answers[playerId] !== undefined) return;
    if (state.showingResult) return;

    const timeMs = Date.now() - state.questionStartTime;
    const newAnswers = { ...state.answers, [playerId]: { optionIndex, timeMs } as PlayerAnswer };

    if (isOnline && playerId === myPlayerId) {
      onlineAnswer!(optionIndex);
    }

    setState(prev => {
      if (!prev) return null;
      const updated = { ...prev, answers: newAnswers };
      // Om alla spelare svarat, avancera omedelbart
      const allAnswered = players.every(p => newAnswers[p.id] !== null && newAnswers[p.id] !== undefined);
      if (allAnswered) {
        return { ...updated, showingResult: false };
      }
      return updated;
    });

    // Kontrollera om alla svarat
    const allNow = players.every(p => newAnswers[p.id] !== null && newAnswers[p.id] !== undefined);
    if (allNow) setTimeout(advanceQuestion, 300);
  }, [state, players, isOnline, myPlayerId, onlineAnswer, advanceQuestion]);

  const handleTimerExpire = useCallback(() => {
    if (!state.showingResult) advanceQuestion();
  }, [state.showingResult, advanceQuestion]);

  const layoutClass = players.length <= 2
    ? 'quiz-players-2'
    : players.length === 3
    ? 'quiz-players-3'
    : 'quiz-players-4';

  return (
    <div className="modal-overlay">
      <div className="modal-card quiz-modal">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-world-badge">{worldName} QUIZ!</div>
          <div className="quiz-progress">Fråga {state.currentQ + 1} / {state.questions.length}</div>
        </div>

        {/* Fråga */}
        <div className="quiz-question">
          <div className="quiz-sign-emoji">{q.signEmoji}</div>
          <div className="quiz-sign-prompt">Vilket tecken är detta?</div>
        </div>

        {/* Timer */}
        <QuizTimer
          durationSec={QUIZ_DURATION}
          startTime={state.questionStartTime}
          onExpire={handleTimerExpire}
          paused={state.showingResult}
        />

        {/* Spelarnas svarsrutor */}
        <div className={`quiz-players ${layoutClass}`}>
          {players.map(player => {
            const answered = state.answers[player.id];
            const isMe = !isOnline || player.id === myPlayerId;
            const canAnswer = isMe && !answered && !state.showingResult;

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
                </div>

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
                        <span className="option-label">{OPTION_LABELS[idx]}</span>
                        <span className="option-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {state.showingResult && answered && (
                  <div className={`quiz-result-badge ${answered.optionIndex === q.correctIndex ? 'right' : 'wrong'}`}>
                    {answered.optionIndex === q.correctIndex
                      ? `+${100 + Math.max(0, 50 - Math.floor(answered.timeMs / 100))} p`
                      : '0 p'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Löpande poängställning */}
        {Object.values(state.sessionScores).some(s => s > 0) && (
          <ScoreBoard players={players} sessionScores={state.sessionScores} />
        )}
      </div>
    </div>
  );
}
