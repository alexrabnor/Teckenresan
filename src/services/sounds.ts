let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) { /* ignorera om audio inte stöds */ }
}

export function soundDice() {
  playTone(150, 0.08, 'sawtooth', 0.2);
  setTimeout(() => playTone(200, 0.08, 'sawtooth', 0.15), 80);
  setTimeout(() => playTone(100, 0.08, 'sawtooth', 0.1), 160);
}

export function soundMove() {
  playTone(440, 0.05, 'sine', 0.15);
}

export function soundCorrect() {
  playTone(523, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
}

export function soundWrong() {
  playTone(200, 0.15, 'sawtooth', 0.2);
  setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.2), 150);
}
