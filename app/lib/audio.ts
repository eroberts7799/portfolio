// Shared WebAudio synth voices for the telemetry demos. All sounds are
// synthesized — Ethan's actual music stays private.

export function kick(ctx: AudioContext, at: number, hard: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(hard ? 160 : 120, at);
  osc.frequency.exponentialRampToValueAtTime(hard ? 55 : 50, at + 0.12);
  gain.gain.setValueAtTime(hard ? 0.55 : 0.28, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + (hard ? 0.22 : 0.15));
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.25);
  // Click transient so the beat reads on laptop/phone speakers.
  const click = ctx.createOscillator();
  const cGain = ctx.createGain();
  click.type = "square";
  click.frequency.setValueAtTime(hard ? 2400 : 1800, at);
  cGain.gain.setValueAtTime(hard ? 0.12 : 0.05, at);
  cGain.gain.exponentialRampToValueAtTime(0.001, at + 0.02);
  click.connect(cGain).connect(ctx.destination);
  click.start(at);
  click.stop(at + 0.03);
}

export function hat(ctx: AudioContext, at: number) {
  const len = Math.floor(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, at);
  src.connect(hp).connect(gain).connect(ctx.destination);
  src.start(at);
}

export function riser(ctx: AudioContext, at: number, seconds: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, at);
  osc.frequency.exponentialRampToValueAtTime(900, at + seconds);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.14, at + seconds);
  gain.gain.exponentialRampToValueAtTime(0.001, at + seconds + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + seconds + 0.1);
}

export function dropHit(ctx: AudioContext, at: number) {
  kick(ctx, at, true);
  // Mid-range stab so the drop is unmistakable on any speaker.
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(440, at);
  osc.frequency.exponentialRampToValueAtTime(180, at + 0.3);
  gain.gain.setValueAtTime(0.22, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.4);
  const len = Math.floor(ctx.sampleRate * 0.25);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.25, at);
  src.connect(gain2).connect(ctx.destination);
  src.start(at);
}
