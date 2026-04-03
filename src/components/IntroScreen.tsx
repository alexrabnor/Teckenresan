interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="screen intro-screen">
      <div className="intro-content">
        <div className="intro-emojis">🤟 🖐️ 👋</div>
        <h1 className="intro-title">TECKENRESAN</h1>
        <p className="intro-subtitle">Lär dig svenska teckenspråk – ett tecken i taget!</p>
        <div className="intro-worlds">
          <div className="intro-world-badge">
            <span>🐻</span> Värld 1: Djur
          </div>
          <div className="intro-world-badge">
            <span>👨‍👩‍👧</span> Värld 2: Familj
          </div>
          <div className="intro-world-badge locked">
            <span>🔒</span> Fler världar...
          </div>
        </div>
        <button className="btn-primary intro-start-btn" onClick={onStart}>
          BÖRJA SPELA
        </button>
        <p className="intro-demo-note">Demo: 2 världar gratis</p>
      </div>
    </div>
  );
}
