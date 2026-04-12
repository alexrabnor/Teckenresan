import { useEffect } from 'react';
import type { BoardEvent } from '../types';

interface Props {
  event: BoardEvent;
  onComplete: () => void;
}

export default function EventModal({ event, onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="event-overlay" onClick={onComplete}>
      <div className="event-card">
        <div className="event-emoji">{event.emoji}</div>
        <div className="event-label">{event.label}</div>
        <div className="event-desc">{event.description}</div>
      </div>
    </div>
  );
}
