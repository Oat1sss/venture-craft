class PixelAudioEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', gainVal = 0.04, delay = 0) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  blip() {
    this.playTone(520, 0.05, 'square', 0.025);
  }

  coin() {
    this.playTone(987.77, 0.07, 'square', 0.035, 0);
    this.playTone(1318.51, 0.14, 'square', 0.035, 0.06);
  }

  ship() {
    this.playTone(440, 0.07, 'triangle', 0.04, 0);
    this.playTone(554.37, 0.07, 'triangle', 0.04, 0.06);
    this.playTone(659.25, 0.12, 'triangle', 0.045, 0.12);
  }

  fanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(f, 0.15, 'square', 0.035, i * 0.08);
    });
  }

  alert() {
    this.playTone(240, 0.1, 'sawtooth', 0.03, 0);
    this.playTone(180, 0.14, 'sawtooth', 0.03, 0.09);
  }
}

export const sfx = new PixelAudioEngine();
