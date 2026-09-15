// Clean Web Audio API rest timer sound generator without external audio dependencies
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

export function playTimerCompletionSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Double chime: 880Hz then 1174Hz (A5 -> D6)
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(660, now, 0.15);
    playTone(880, now + 0.16, 0.18);
    playTone(1320, now + 0.35, 0.35);

    // Also vibrate if supported on phone
    if ('vibrate' in navigator) {
      navigator.vibrate([150, 80, 200]);
    }
  } catch (err) {
    console.warn('Could not play sound:', err);
  }
}
