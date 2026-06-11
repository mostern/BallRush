export class AudioSystem {
  constructor() {
    this.context = null;
    this.master = null;
  }

  resume() {
    const activation = navigator.userActivation;
    if (!this.context && activation && !activation.isActive) return;

    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
  }

  collect(gold = false) {
    this.tone(gold ? 880 : 640, 0.06, "triangle", gold ? 0.18 : 0.11);
    this.tone(gold ? 1320 : 960, 0.08, "sine", 0.06, 0.035);
  }

  crash() {
    this.noise(0.32, 0.26);
    this.tone(86, 0.28, "sawtooth", 0.18);
  }

  jump() {
    this.tone(220, 0.08, "sine", 0.08);
    this.tone(360, 0.11, "triangle", 0.06, 0.04);
  }

  flow() {
    this.tone(440, 0.12, "sine", 0.12);
    this.tone(880, 0.18, "triangle", 0.12, 0.08);
  }

  shield() {
    this.tone(310, 0.12, "sine", 0.1);
    this.tone(520, 0.18, "sine", 0.08, 0.05);
  }

  tone(frequency, duration, type = "sine", volume = 0.1, delay = 0) {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  noise(duration = 0.2, volume = 0.15) {
    if (!this.context || !this.master) return;
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.master);
    source.start();
  }
}
