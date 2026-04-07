import { useEffect, useState } from 'react';

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    setIsDark(saved === 'dark');
  }, []);

  function toggleDark() {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsDark(!isDark);
  }

  return (
    <div className="screen intro-screen">
      <button className="btn-darkmode" onClick={toggleDark} title="Växla mörkt/ljust läge">
        {isDark ? '☀️' : '🌙'}
      </button>
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
