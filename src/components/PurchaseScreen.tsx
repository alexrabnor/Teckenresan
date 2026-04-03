interface Props {
  onRestart: () => void;
}

export default function PurchaseScreen({ onRestart }: Props) {
  return (
    <div className="screen purchase-screen">
      <div className="purchase-content">
        <div className="purchase-trophy">🏆</div>
        <h1 className="purchase-title">Grattis!</h1>
        <p className="purchase-subtitle">Du har klarat demoversionen av Teckenresan!</p>

        <div className="purchase-completed">
          <div className="completed-world">✅ Värld 1: DJUR</div>
          <div className="completed-world">✅ Värld 2: FAMILJ</div>
        </div>

        <div className="purchase-card">
          <h2>🔓 Köp hela spelet!</h2>
          <p>Få tillgång till alla världar och hundratals tecken:</p>
          <ul className="purchase-features">
            <li>🍕 Värld 3: MAT</li>
            <li>🏠 Värld 4: VARDAG</li>
            <li>🎨 Värld 5: FÄRGER</li>
            <li>📅 Värld 6: VECKODAGAR</li>
            <li>+ fler världar på väg!</li>
          </ul>
          <div className="purchase-price">Kontakta oss för pris</div>
          <button className="btn-primary purchase-btn">
            Köp hela spelet →
          </button>
        </div>

        <button className="btn-back" onClick={onRestart} style={{ marginTop: '1rem' }}>
          ← Spela igen
        </button>
      </div>
    </div>
  );
}
