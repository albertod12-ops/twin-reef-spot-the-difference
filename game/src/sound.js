// Sounds, synthesized with WebAudio — no audio files, no network. A found
// difference chimes, a miss buzzes low, a cleared scene plays a little run.
export function createSound(enabled) {
  let context = null;
  let on = enabled;

  function ac() {
    if (context === null) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, start, dur, type, gain) {
    if (!on) return;
    const ctx = ac();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  }

  return {
    isOn() { return on; },
    setOn(value) { on = value; },
    click() { tone(1200, 0, 0.05, 'sine', 0.08); },
    found() { tone(880, 0, 0.12, 'sine', 0.16); tone(1318, 0.09, 0.18, 'sine', 0.16); },
    miss() { tone(160, 0, 0.22, 'sawtooth', 0.1); },
    hint() { tone(660, 0, 0.1, 'triangle', 0.12); tone(990, 0.08, 0.12, 'triangle', 0.12); },
    clear() { tone(523, 0, 0.14, 'sine', 0.16); tone(659, 0.12, 0.14, 'sine', 0.16); tone(784, 0.24, 0.2, 'sine', 0.16); tone(1046, 0.36, 0.3, 'sine', 0.16); },
    win() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.13, 0.22, 'sine', 0.16)); },
    timeout() { tone(392, 0, 0.2, 'sine', 0.14); tone(311, 0.18, 0.3, 'sine', 0.14); },
  };
}
