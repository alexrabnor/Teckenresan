import { useEffect, useState } from 'react';
import type { ToastMessage } from '../types';

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

interface ToastItem extends ToastMessage {
  exiting: boolean;
}

export default function Toast({ toasts, onDismiss }: Props) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    setItems(prev => {
      const existing = new Set(prev.map(i => i.id));
      const incoming = toasts.filter(t => !existing.has(t.id));
      return [...prev, ...incoming.map(t => ({ ...t, exiting: false }))];
    });
  }, [toasts]);

  useEffect(() => {
    if (items.length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach(item => {
      if (item.exiting) return;
      const dur = item.duration ?? 2000;
      timers.push(setTimeout(() => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, exiting: true } : i));
        setTimeout(() => {
          setItems(prev => prev.filter(i => i.id !== item.id));
          onDismiss(item.id);
        }, 300);
      }, dur));
    });
    return () => timers.forEach(clearTimeout);
  }, [items.map(i => i.id).join(',')]);

  if (items.length === 0) return null;

  return (
    <div className="toast-container">
      {items.map(item => (
        <div
          key={item.id}
          className={`toast toast-${item.type ?? 'info'}${item.exiting ? ' toast-exit' : ' toast-enter'}`}
          onClick={() => {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, exiting: true } : i));
            setTimeout(() => {
              setItems(prev => prev.filter(i => i.id !== item.id));
              onDismiss(item.id);
            }, 300);
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
