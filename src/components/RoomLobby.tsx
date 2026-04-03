import { useState } from 'react';
import type { Player } from '../types';
import { generateRoomCode, createRoom, joinRoom, startRoom, listenRoom } from '../services/room';

const AVATARS = ['🧍', '🧒', '👩', '👴'];
const COLORS = ['#1e88e5', '#e53935', '#43a047', '#ff6f00'];

interface Props {
  onReady: (code: string, playerId: string, player: Player) => void;
  onBack: () => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function RoomLobby({ onReady, onBack }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [status, setStatus] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [myId] = useState(makeId);
  const [waiting, setWaiting] = useState(false);

  const playerInfo: Player = {
    id: myId,
    name: name.trim() || 'Spelare',
    avatar,
    color,
    score: 0,
  };

  const handleCreate = async () => {
    if (!name.trim()) { setStatus('Ange ditt namn'); return; }
    setStatus('Skapar rum...');
    const code = generateRoomCode();
    await createRoom(code, playerInfo);
    setCreatedCode(code);
    setIsHost(true);
    setWaiting(true);

    // Listen for player count and updates
    listenRoom(code, room => {
      setPlayerCount(Object.keys(room.players).length);
    });
    setStatus('');
  };

  const handleJoin = async () => {
    if (!name.trim()) { setStatus('Ange ditt namn'); return; }
    if (!joinCode.trim()) { setStatus('Ange rums-kod'); return; }
    setStatus('Ansluter...');
    const room = await joinRoom(joinCode.trim(), playerInfo);
    if (!room) { setStatus('Hittade inte rummet. Kolla koden!'); return; }
    setStatus('Ansluten! Väntar på att värden startar...');
    setWaiting(true);

    listenRoom(joinCode.trim(), r => {
      if (r.started) onReady(joinCode.trim(), myId, playerInfo);
    });
  };

  const handleStart = async () => {
    await startRoom(createdCode);
    onReady(createdCode, myId, playerInfo);
  };

  if (waiting && isHost) {
    return (
      <div className="screen lobby-screen">
        <div className="lobby-content">
          <h2>Ditt rum är redo!</h2>
          <div className="room-code-display">
            <div className="room-code-label">Rums-kod</div>
            <div className="room-code-value">{createdCode}</div>
            <div className="room-code-hint">Dela denna kod med dina vänner</div>
          </div>
          <div className="lobby-player-count">{playerCount} spelare anslutna</div>
          <button className="btn-primary" onClick={handleStart} disabled={playerCount < 1}>
            Starta spelet!
          </button>
          <button className="btn-back" onClick={onBack}>← Avbryt</button>
        </div>
      </div>
    );
  }

  if (waiting && !isHost) {
    return (
      <div className="screen lobby-screen">
        <div className="lobby-content">
          <h2>Ansluten! ✓</h2>
          <div className="room-code-display">
            <div className="room-code-label">Rumskod</div>
            <div className="room-code-value">{joinCode}</div>
          </div>
          <p>Väntar på att värden startar spelet...</p>
          <div className="lobby-spinner">⏳</div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen lobby-screen">
      <div className="lobby-content">
        <h2>Online-spel</h2>

        {/* Name + avatar */}
        <div className="lobby-player-row">
          <select className="avatar-select" value={avatar} onChange={e => setAvatar(e.target.value)}>
            {AVATARS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            className="player-name-input"
            placeholder="Ditt namn"
            value={name}
            maxLength={16}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Color */}
        <div className="color-picker lobby-colors">
          {COLORS.map(c => (
            <button key={c} className={`color-dot${color === c ? ' selected' : ''}`}
              style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>

        {/* Tab */}
        <div className="lobby-tabs">
          <button className={`lobby-tab${tab === 'create' ? ' active' : ''}`} onClick={() => setTab('create')}>
            Skapa rum
          </button>
          <button className={`lobby-tab${tab === 'join' ? ' active' : ''}`} onClick={() => setTab('join')}>
            Gå med
          </button>
        </div>

        {tab === 'create' && (
          <button className="btn-primary" onClick={handleCreate}>Skapa rum</button>
        )}
        {tab === 'join' && (
          <div className="lobby-join">
            <input
              className="room-code-input"
              placeholder="Ange rums-kod (t.ex. 7392)"
              value={joinCode}
              maxLength={4}
              onChange={e => setJoinCode(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn-primary" onClick={handleJoin}>Gå med!</button>
          </div>
        )}

        {status && <div className="lobby-status">{status}</div>}
        <button className="btn-back" onClick={onBack}>← Tillbaka</button>
      </div>
    </div>
  );
}
