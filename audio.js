/**
 * Procedural Audio Engine using Web Audio API
 * Generates crisp, modern synthesized sound effects with zero external assets.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('quiz_sound_muted') === 'true';
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('quiz_sound_muted', this.isMuted.toString());
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, delay = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playClick() {
    this.playTone(800, 'triangle', 0.04, 0.1);
  }

  playCorrect() {
    if (this.isMuted) return;
    this.initContext();
    // Pleasant rising harmonic major 3rd/5th
    this.playTone(523.25, 'sine', 0.18, 0.2, 0);       // C5
    this.playTone(659.25, 'sine', 0.22, 0.2, 0.08);    // E5
    this.playTone(783.99, 'sine', 0.35, 0.25, 0.16);   // G5
  }

  playWrong() {
    if (this.isMuted) return;
    this.initContext();
    // Gentle low dissonance
    this.playTone(220, 'sawtooth', 0.2, 0.12, 0);     // A3
    this.playTone(207.65, 'sawtooth', 0.3, 0.12, 0.1); // G#3
  }

  playStreak() {
    if (this.isMuted) return;
    this.initContext();
    // Ascending arpeggio with shimmer
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((note, idx) => {
      this.playTone(note, 'triangle', 0.25, 0.15, idx * 0.06);
    });
  }

  playLifeline() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(440, 'sine', 0.12, 0.15, 0);
    this.playTone(880, 'sine', 0.2, 0.18, 0.08);
  }

  playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    // Victory fanfare chords
    const chord1 = [523.25, 659.25, 783.99]; // C major
    const chord2 = [587.33, 739.99, 880.00]; // D major
    const chord3 = [659.25, 830.61, 987.77]; // E major
    const chord4 = [1046.50, 1318.51, 1567.98]; // High C oct

    chord1.forEach(f => this.playTone(f, 'triangle', 0.25, 0.1, 0));
    chord2.forEach(f => this.playTone(f, 'triangle', 0.25, 0.1, 0.18));
    chord3.forEach(f => this.playTone(f, 'triangle', 0.3, 0.12, 0.36));
    chord4.forEach(f => this.playTone(f, 'sine', 0.6, 0.2, 0.54));
  }
}

const audio = new SoundEngine();
