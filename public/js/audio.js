/**
 * CyberAudio: Web Audio API Procedural Sound Synthesizer
 * 100% self-contained, zero external mp3/wav files required,
 * works perfectly offline on any modern browser.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.7;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.initAudioContext();
  }

  initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      const resume = () => {
        if (this.ctx) this.ctx.resume();
        window.removeEventListener('click', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('click', resume);
      window.addEventListener('keydown', resume);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.muted && this.bgmPlaying) {
      this.stopBgm();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // --- SOUND EFFECTS ---

  // Standard Laser Shot
  playLaser() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Heavy Plasma / Spread Shot
  playHeavyShot() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    subOsc.type = 'sine';

    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);

    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.21);
    subOsc.stop(now + 0.21);
  }

  // Explosion (Synthesized with White Noise + Low Pass Filter)
  playExplosion(isLarge = false) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const duration = isLarge ? 0.7 : 0.35;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(isLarge ? 800 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime((isLarge ? 0.6 : 0.4) * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Player Damage Hit
  playPlayerHit() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.5 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Shield Ping
  playShieldDeflect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Powerup Collect (Ascending Chime)
  playPowerup() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25 * this.volume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.16);
    });
  }

  // EMP Blast Wave
  playEMP() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.7);

    gain.gain.setValueAtTime(0.6 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
    this.playExplosion(true);
  }

  // Level Clear / Fanfare
  playLevelUp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.3 * this.volume, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.26);
    });
  }

  // Boss Warning Klaxon
  playBossAlarm() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now + i * 0.35);
      osc.frequency.linearRampToValueAtTime(420, now + i * 0.35 + 0.25);

      gain.gain.setValueAtTime(0.4 * this.volume, now + i * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.35 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.31);
    }
  }

  // Low Timer Warning Beep
  playTimerBeep() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Victory Anthem
  playVictory() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sequence = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.4 }
    ];

    let t = this.ctx.currentTime;
    sequence.forEach(item => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + item.d + 0.02);
      t += item.d + 0.05;
    });
  }

  // Ambient Cyber Drone / Pulsing Synth BGM (Lightweight & 100% Procedural)
  startBgm() {
    if (this.muted || this.bgmPlaying) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 98, 110, 110, 146.83, 130.81];

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.bgmPlaying || !this.ctx) return;
      try {
        const freq = bassline[step % bassline.length];
        const now = this.ctx.currentTime;

        // Sub pulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq / 2, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);

        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);

        // Hi-hat noise on alternating steps
        if (step % 2 === 1) {
          const hatSize = this.ctx.sampleRate * 0.04;
          const hatBuf = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
          const hatData = hatBuf.getChannelData(0);
          for (let i = 0; i < hatSize; i++) hatData[i] = (Math.random() * 2 - 1) * 0.1;

          const hatSrc = this.ctx.createBufferSource();
          hatSrc.buffer = hatBuf;
          const hatFilter = this.ctx.createBiquadFilter();
          hatFilter.type = 'highpass';
          hatFilter.frequency.setValueAtTime(7000, now);

          const hatGain = this.ctx.createGain();
          hatGain.gain.setValueAtTime(0.08 * this.volume, now);
          hatGain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

          hatSrc.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.ctx.destination);

          hatSrc.start(now);
        }

        step++;
      } catch (e) {
        console.warn('BGM error:', e);
      }
    }, 400); // 150 BPM pulse
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global audio singleton
window.cyberAudio = new SoundController();
