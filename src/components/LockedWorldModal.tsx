interface LockedWorld {
  name: string;
  icon: string;
  signs: Array<{ emoji: string; name: string }>;
}

interface Props {
  world: LockedWorld;
  onClose: () => void;
}

export default function LockedWorldModal({ world, onClose }: Props) {
  const previewSign = world.signs[Math.floor(Math.random() * world.signs.length)];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="locked-modal" onClick={e => e.stopPropagation()}>
        <button className="locked-modal-close" onClick={onClose}>✕</button>
        <div className="locked-modal-icon">{world.icon}</div>
        <div className="locked-modal-title">{world.name}</div>
        <p className="locked-modal-subtitle">Prova ett gratis tecken!</p>
        <div className="locked-preview-sign">
          <div className="locked-preview-emoji">{previewSign.emoji}</div>
          <div className="locked-preview-name">{previewSign.name}</div>
        </div>
        <button className="locked-unlock-btn">
          Lås upp i hela spelet →
        </button>
      </div>
    </div>
  );
}
