import { useState } from 'react';
import type { AppPhase, Player } from './types';
import IntroScreen from './components/IntroScreen';
import ModeSelect from './components/ModeSelect';
import PlayerSetup from './components/PlayerSetup';
import RoomLobby from './components/RoomLobby';
import LocalGame from './LocalGame';
import OnlineGame from './OnlineGame';
import PurchaseScreen from './components/PurchaseScreen';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('intro');
  const [localPlayers, setLocalPlayers] = useState<Player[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);

  const handleLocalStart = () => setPhase('player-setup');
  const handleOnlineStart = () => setPhase('room-lobby');

  const handlePlayersReady = (players: Player[]) => {
    setLocalPlayers(players);
    setPhase('playing-local');
  };

  const handleRoomReady = (code: string, playerId: string, player: Player) => {
    setRoomCode(code);
    setMyPlayerId(playerId);
    setMyPlayer(player);
    setPhase('playing-online');
  };

  const handleGameComplete = () => setPhase('purchase');

  const handleRestart = () => {
    setLocalPlayers([]);
    setRoomCode('');
    setMyPlayerId('');
    setMyPlayer(null);
    setPhase('intro');
  };

  if (phase === 'intro') return <IntroScreen onStart={() => setPhase('mode-select')} />;
  if (phase === 'mode-select') return (
    <ModeSelect onLocal={handleLocalStart} onOnline={handleOnlineStart} onBack={() => setPhase('intro')} />
  );
  if (phase === 'player-setup') return (
    <PlayerSetup onReady={handlePlayersReady} onBack={() => setPhase('mode-select')} />
  );
  if (phase === 'room-lobby') return (
    <RoomLobby onReady={handleRoomReady} onBack={() => setPhase('mode-select')} />
  );
  if (phase === 'playing-local') return (
    <LocalGame players={localPlayers} onComplete={handleGameComplete} />
  );
  if (phase === 'playing-online' && myPlayer) return (
    <OnlineGame
      roomCode={roomCode}
      myPlayerId={myPlayerId}
      myPlayer={myPlayer}
      onComplete={handleGameComplete}
    />
  );
  if (phase === 'purchase') return <PurchaseScreen onRestart={handleRestart} />;
  return null;
}
