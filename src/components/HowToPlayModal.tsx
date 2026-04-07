interface Props {
  onClose: () => void;
}

export default function HowToPlayModal({ onClose }: Props) {
  const steps = [
    { icon: '🎲', title: 'Slå tärningen', desc: 'Din bricka flyttas framåt på spelplanen.' },
    { icon: '👋', title: 'Lär dig ett tecken', desc: 'Se vilket tecken rutan handlar om – öva det!' },
    { icon: '🏁', title: 'Nå TEMA-rutan', desc: 'Svara på 4 quiz-frågor om tecknen du lärt dig.' },
    { icon: '⚡', title: 'Snabba svar ger bonus', desc: 'Ju snabbare du svarar, desto fler poäng får du.' },
    { icon: '🏆', title: 'Högst poäng vinner!', desc: 'Spelaren med mest poäng efter alla världar vinner.' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card howto-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="howto-title">🤟 Hur man spelar</h2>
        <div className="howto-steps">
          {steps.map((s, i) => (
            <div key={i} className="howto-step">
              <div className="howto-step-num">{i + 1}</div>
              <div className="howto-step-icon">{s.icon}</div>
              <div className="howto-step-text">
                <strong>{s.title}</strong>
                <span>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
