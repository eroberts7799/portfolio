"use client";

import { useEffect, useRef, useState } from "react";

// Representative session shaped like a real Garmin export: 8-minute segment,
// sampled every 8s. Swap for a real parity-suite fixture when exported.
type Sample = { t: number; hr: number; grade: number };

const SESSION: Sample[] = Array.from({ length: 61 }, (_, i) => {
  const t = i * 8;
  // Flat warm-up, climb from 150s cresting ~192s, descent after.
  const inClimb = t >= 150 && t <= 240;
  const grade = inClimb ? 6 * Math.sin(((t - 150) / 90) * Math.PI) : 0.5;
  const base = 138 + t * 0.04;
  const hr = Math.round(
    Math.min(178, base + (inClimb ? (t - 150) * 0.45 : 0) + (t > 240 ? -8 : 0)),
  );
  return { t, hr, grade: Math.max(0, grade) };
});

const DURATION_S = SESSION[SESSION.length - 1].t; // 480s of session

// Mini-scheduler mimicking the conductor: scan ahead for a sustained climb,
// schedule the drop at the steepest point, cue the deck 12s prior.
function schedule(session: Sample[]) {
  const climbStart = session.find((s) => s.grade > 2);
  if (!climbStart) return null;
  const steepest = session.reduce((a, b) => (b.grade > a.grade ? b : a));
  return {
    detectAt: climbStart.t,
    cueAt: steepest.t - 12,
    dropAt: steepest.t,
  };
}

const PLAN = schedule(SESSION)!;

// Nonlinear replay clock: sprint through the flat, slow down for the story.
// [sessionStart, sessionEnd, realSeconds]
const SEGMENTS: Array<[number, number, number]> = [
  [0, 130, 6], // warm-up flat - compressed hard
  [130, PLAN.cueAt, 10], // climb detected, drop scheduled
  [PLAN.cueAt, PLAN.dropAt, 6], // the build - give the riser room
  [PLAN.dropAt, 250, 6], // the drop and the crest
  [250, DURATION_S, 6], // descent
];
const REPLAY_S = SEGMENTS.reduce((a, s) => a + s[2], 0);

function realFromSession(t: number) {
  let real = 0;
  for (const [s0, s1, dur] of SEGMENTS) {
    if (t <= s0) return real;
    if (t >= s1) real += dur;
    else return real + ((t - s0) / (s1 - s0)) * dur;
  }
  return real;
}

function sessionFromReal(r: number) {
  let acc = 0;
  for (const [s0, s1, dur] of SEGMENTS) {
    if (r <= acc + dur) return s0 + ((r - acc) / dur) * (s1 - s0);
    acc += dur;
  }
  return DURATION_S;
}

// Captions live on the REAL clock, spaced so each one is actually readable.
const CAPTIONS: Array<{ at: number; text: string }> = [
  { at: 0.4, text: "A runner starts up a road. The watch streams heart rate live." },
  {
    at: realFromSession(PLAN.detectAt) + 0.6,
    text: "The engine looks ahead, sees the hill coming — and schedules the beat-drop for its steepest moment.",
  },
  { at: realFromSession(PLAN.cueAt), text: "Music builds…" },
  {
    at: realFromSession(PLAN.dropAt),
    text: "DROP — right as the hill bites hardest. That's the whole product.",
  },
];

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const W = 600;
const H = 150;

function x(t: number) {
  return (t / DURATION_S) * W;
}

const HR_MIN = 130;
const HR_MAX = 185;

function yHr(hr: number) {
  return H - ((hr - HR_MIN) / (HR_MAX - HR_MIN)) * (H - 20) - 10;
}

const hrPath = SESSION.map(
  (s, i) => `${i === 0 ? "M" : "L"}${x(s.t).toFixed(1)},${yHr(s.hr).toFixed(1)}`,
).join(" ");

const gradePath =
  `M0,${H} ` +
  SESSION.map(
    (s) => `L${x(s.t).toFixed(1)},${(H - s.grade * 14).toFixed(1)}`,
  ).join(" ") +
  ` L${W},${H} Z`;

// --- Audio ---------------------------------------------------------------
// Real music via Mixkit (mixkit.co, Mixkit License — free for web projects).
// The track has a genuine EDM arrangement; it is trimmed so its own drop
// detonates exactly at the engine's scheduled moment (replay t=22s). A
// layered impact hit syncs the slam; synth fallback if the load fails.

function dropHit(ctx: AudioContext, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, at);
  osc.frequency.exponentialRampToValueAtTime(55, at + 0.12);
  gain.gain.setValueAtTime(0.6, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.3);
  const len = Math.floor(ctx.sampleRate * 0.25);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.3, at);
  src.connect(g2).connect(ctx.destination);
  src.start(at);
}

function synthFallback(ctx: AudioContext, t0: number, dropR: number, endR: number) {
  // Minimal beat if the track can't load: kicks to the drop, double-time after.
  for (let r = 0; r < endR; r += r < dropR ? 0.54 : 0.27) {
    const at = t0 + r;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(r < dropR ? 120 : 160, at);
    osc.frequency.exponentialRampToValueAtTime(50, at + 0.12);
    g.gain.setValueAtTime(r < dropR ? 0.25 : 0.45, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.2);
  }
  dropHit(ctx, t0 + dropR);
}

type Phase = "idle" | "playing" | "done";

export default function AwdjDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [clock, setClock] = useState(0); // session seconds
  const [elapsed, setElapsed] = useState(0); // real seconds
  const [log, setLog] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const raf = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const trackBuf = useRef<AudioBuffer | null>(null);
  const master = useRef<GainNode | null>(null);
  const playing = useRef<AudioBufferSourceNode | null>(null);
  const fired = useRef<{ [k: string]: boolean }>({});
  const mutedRef = useRef(false);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      try {
        playing.current?.stop();
      } catch {}
    },
    [],
  );

  const startAudio = async (ctx: AudioContext) => {
    const dropR = realFromSession(PLAN.dropAt);
    const cueR = realFromSession(PLAN.cueAt);
    if (!trackBuf.current) {
      try {
        const res = await fetch("/awdj-track.mp3");
        trackBuf.current = await ctx.decodeAudioData(await res.arrayBuffer());
      } catch {
        synthFallback(ctx, ctx.currentTime + 0.05, dropR, REPLAY_S);
        return;
      }
    }
    const t0 = ctx.currentTime + 0.05;
    const src = ctx.createBufferSource();
    src.buffer = trackBuf.current;
    const gain = ctx.createGain();
    master.current = gain;
    src.connect(gain).connect(ctx.destination);
    playing.current = src;

    // The track is pre-cut so its own intro/build fills the cruise and its
    // real drop lands at exactly t0 + dropR. Just ride the volume.
    void cueR;
    gain.gain.setValueAtTime(0.85, t0);
    // Layered impact so the slam is physical even on laptop speakers.
    dropHit(ctx, t0 + dropR);
    // Land the ending.
    gain.gain.setValueAtTime(0.85, t0 + REPLAY_S - 1.5);
    gain.gain.linearRampToValueAtTime(0.0001, t0 + REPLAY_S);
    src.start(t0, 0);
    src.stop(t0 + REPLAY_S + 0.2);
  };

  const start = async () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setClock(DURATION_S);
      setElapsed(REPLAY_S);
      setLog([
        `▸ onTimerStart → t=0 backdated`,
        `▸ ${fmt(PLAN.detectAt)} climb detected · grade rising`,
        `▸ drop scheduled ${fmt(PLAN.dropAt)} · deck B cued ${fmt(PLAN.cueAt)}`,
        `▸ ${fmt(PLAN.dropAt)} DROP — landed on the steepest meter`,
      ]);
      setPhase("done");
      return;
    }
    if (!audio.current) audio.current = new AudioContext();
    if (audio.current.state === "suspended") await audio.current.resume();
    fired.current = {};
    setLog([`▸ onTimerStart → t=0 backdated`]);
    setPhase("playing");
    if (!mutedRef.current) await startAudio(audio.current);
    const begun = performance.now();
    const step = (now: number) => {
      const realT = Math.min(REPLAY_S, (now - begun) / 1000);
      const sessionT = sessionFromReal(realT);
      setElapsed(realT);
      setClock(sessionT);
      const fire = (key: string, at: number, fn: () => void) => {
        if (!fired.current[key] && sessionT >= at) {
          fired.current[key] = true;
          fn();
        }
      };
      fire("detect", PLAN.detectAt, () =>
        setLog((l) => [...l, `▸ ${fmt(PLAN.detectAt)} climb detected · scanning profile`]),
      );
      fire("sched", PLAN.detectAt + 8, () =>
        setLog((l) => [...l, `▸ drop scheduled ${fmt(PLAN.dropAt)} · steepest meter`]),
      );
      fire("cue", PLAN.cueAt, () =>
        setLog((l) => [...l, `▸ ${fmt(PLAN.cueAt)} deck B cued · filter opening`]),
      );
      fire("drop", PLAN.dropAt, () =>
        setLog((l) => [...l, `▸ ${fmt(PLAN.dropAt)} DROP — landed on the steepest meter`]),
      );
      if (realT >= REPLAY_S) {
        setPhase("done");
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (master.current && audio.current) {
      master.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.85,
        audio.current.currentTime,
        0.05,
      );
    }
  };

  const playheadX = x(clock);
  const dropped = clock >= PLAN.dropAt;
  const caption =
    phase === "idle"
      ? "30-second replay of a real-shaped run, set to real music. Sound on — the drop is the point."
      : [...CAPTIONS].reverse().find((c) => elapsed >= c.at)?.text ?? "";

  return (
    <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">
          session replay · representative data
        </p>
        <div className="flex items-center gap-3">
          {phase !== "idle" && (
            <button
              className="opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
              onClick={toggleMute}
            >
              {muted ? "sound off" : "sound on"}
            </button>
          )}
          <span className="tabular-nums">{fmt(clock)}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Heart rate rising over an elevation profile; a music drop is scheduled for the steepest point of the climb"
      >
        <path d={gradePath} fill="var(--rule)" opacity="0.8" />
        <text x={x(195)} y={H - 8} fill="var(--dust)" fontSize="11" textAnchor="middle">
          the hill
        </text>
        <path
          d={hrPath}
          fill="none"
          stroke="var(--phosphor)"
          strokeWidth="1.5"
          strokeDasharray="1200"
          strokeDashoffset={phase === "idle" ? 1200 : 1200 - (clock / DURATION_S) * 1200}
        />
        <text x="6" y={yHr(SESSION[0].hr) - 8} fill="var(--phosphor)" fontSize="11">
          heart rate
        </text>
        <line
          x1={x(PLAN.dropAt)}
          y1="0"
          x2={x(PLAN.dropAt)}
          y2={H}
          stroke={dropped ? "var(--signal)" : "var(--dust)"}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={x(PLAN.dropAt) + 6}
          y="14"
          fill={dropped ? "var(--signal)" : "var(--dust)"}
          fontSize="11"
        >
          drop {fmt(PLAN.dropAt)}
        </text>
        {phase !== "idle" && (
          <line
            x1={playheadX}
            y1="0"
            x2={playheadX}
            y2={H}
            stroke="var(--bone)"
            strokeWidth="1"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Plain-language layer: anyone can follow the story without the log. */}
      <p className="mt-3 min-h-[3.4em] font-sans text-[0.9375rem] leading-snug text-bone">
        {caption}
      </p>

      <div className="mt-3 min-h-[6.5rem] opacity-80">
        {phase === "idle" ? (
          <>
            <p>onTimerStart → t=0 backdated</p>
            <p>HR 162 → drop scheduled 03:12</p>
            <p className="cursor">deck B cued ▸ armed</p>
          </>
        ) : (
          log.map((l, i) => (
            <p key={l} className={i === log.length - 1 ? "cursor" : undefined}>
              {l}
            </p>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          className="border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
          onClick={start}
          disabled={phase === "playing"}
        >
          {phase === "idle" ? "▸ replay a run" : phase === "playing" ? "replaying…" : "▸ replay again"}
        </button>
        <p className="text-[0.625rem] uppercase tracking-[0.12em] opacity-40">
          music via Mixkit (mixkit.co) · Mixkit License
        </p>
      </div>
    </div>
  );
}
