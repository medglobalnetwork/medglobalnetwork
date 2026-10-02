// ============================================================
// MGN Ringtone
// lib/ringtone.ts
//
// Synthesized with the Web Audio API rather than shipped as an audio
// file: no APK weight, no asset caching, and the pattern can be tuned
// in code. Two-tone European ring, same cadence for outgoing and
// incoming.
// ============================================================

let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let gain: GainNode | null = null;
let playing = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  if (!ctx) ctx = new Ctor();
  // Browsers start the context suspended until a gesture unlocks it.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One burst of the two-tone pattern. */
function burst(context: AudioContext, out: GainNode, startAt: number) {
  const tones = [
    { freq: 440, at: startAt, dur: 0.4 },
    { freq: 480, at: startAt + 0.45, dur: 0.4 },
  ];

  for (const tone of tones) {
    const osc = context.createOscillator();
    const env = context.createGain();
    osc.type = "sine";
    osc.frequency.value = tone.freq;

    env.gain.setValueAtTime(0.0001, tone.at);
    env.gain.exponentialRampToValueAtTime(0.28, tone.at + 0.04);
    env.gain.setValueAtTime(0.28, tone.at + tone.dur - 0.06);
    env.gain.exponentialRampToValueAtTime(0.0001, tone.at + tone.dur);

    osc.connect(env);
    env.connect(out);
    osc.start(tone.at);
    osc.stop(tone.at + tone.dur + 0.02);
  }
}

const PATTERN_MS = 2200;

/** Starts looping the ringtone. Safe to call repeatedly. */
export function startRingtone(): void {
  if (playing) return;
  const context = getContext();
  if (!context) return;

  playing = true;
  gain = context.createGain();
  gain.gain.value = 1;
  gain.connect(context.destination);

  const loop = () => {
    if (!playing || !ctx || !gain) return;
    burst(ctx, gain, ctx.currentTime + 0.05);
    timer = setTimeout(loop, PATTERN_MS);
  };
  loop();
}

/** Stops the ringtone. Safe to call when not ringing. */
export function stopRingtone(): void {
  playing = false;
  if (timer) clearTimeout(timer);
  timer = null;

  if (ctx && gain) {
    // Fade rather than cut — an abrupt stop reads as a glitch.
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    const dead = gain;
    setTimeout(() => dead.disconnect(), 200);
  }
  gain = null;
}

export function isRinging(): boolean {
  return playing;
}