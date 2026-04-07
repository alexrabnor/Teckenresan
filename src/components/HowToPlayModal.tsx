interface Props {
  onClose: () => void;
}

const steps = [
  {
    icon: '🎲',
    title: 'Slå tärningen',
    desc: 'Din bricka flyttas framåt på spelplanen.',
    color: '#4CAF50',
    bg: '#E8F5E9',
  },
  {
    icon: '👋',
    title: 'Lär dig ett tecken',
    desc: 'Se vilket tecken rutan handlar om – öva det!',
    color: '#1E88E5',
    bg: '#E3F2FD',
  },
  {
    icon: '🏁',
    title: 'Nå TEMA-rutan',
    desc: 'Svara på 4 quiz-frågor om tecknen du lärt dig.',
    color: '#FB8C00',
    bg: '#FFF3E0',
  },
  {
    icon: '⚡',
    title: 'Snabba svar ger bonus',
    desc: 'Ju snabbare du svarar, desto fler poäng får du.',
    color: '#8E24AA',
    bg: '#F3E5F5',
  },
  {
    icon: '🏆',
    title: 'Högst poäng vinner!',
    desc: 'Spelaren med mest poäng efter alla världar vinner.',
    color: '#E53935',
    bg: '#FFEBEE',
  },
];

export default function HowToPlayModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="howto-card" onClick={e => e.stopPropagation()}>
        <button className="howto-close" onClick={onClose}>✕</button>

        <div className="howto-header">
          <span className="howto-header-emoji">🤟</span>
          <h2 className="howto-title">Hur man spelar</h2>
          <p className="howto-subtitle">Lär dig svenska teckenspråket med ett roligt brädspel!</p>
        </div>

        <div className="howto-steps">
          {steps.map((s, i) => (
            <div key={i} className="howto-step" style={{ borderLeftColor: s.color }}>
              <div className="howto-step-left">
                <div className="howto-step-num" style={{ background: s.color }}>{i + 1}</div>
                <div className="howto-step-icon" style={{ background: s.bg }}>{s.icon}</div>
              </div>
              <div className="howto-step-text">
                <strong style={{ color: s.color }}>{s.title}</strong>
                <span>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="howto-start-btn" onClick={onClose}>
          Kom igång! 🚀
        </button>
      </div>
    </div>
  );
}
