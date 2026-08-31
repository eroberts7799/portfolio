"use client";

import { useEffect, useRef, useState } from "react";
import { kick, hat, riser, dropHit } from "../lib/audio";

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
const REPLAY_MS = 30000; // compressed to 30s
const W = 600;
const H = 150;

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

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

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

type Phase = "idle" | "playing" | "done";

const CAPTIONS: Array<{ at: number; text: string }> = [
  { at: 0, text: "A runner starts up a road. The watch streams heart rate live." },
  {
    at: PLAN.detectAt,
    text: "The engine looks ahead and sees the hill coming.",
  },
  {
    at: PLAN.detectAt + 8,
    text: "It picks the steepest moment of the climb — and schedules the beat-drop for exactly then.",
  },
  { at: PLAN.cueAt, text: "Music builds…" },
  {
    at: PLAN.dropAt,
    text: "DROP — right as the hill bites hardest. That's the whole product.",
  },
];

export default function AwdjDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [clock, setClock] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const raf = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const fired = useRef<{ [k: string]: boolean }>({});
  const mutedRef = useRef(false);
  const nextBeat = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const start = async () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setClock(DURATION_S);
      setLog([
        `▸ onTimerStart → t=0 backdated`,
        `▸ ${fmt(PLAN.detectAt)} climb detected · grade rising`,
        `▸ drop scheduled ${fmt(PLAN.dropAt)} · deck B cued ${fmt(PLAN.cueAt)}`,
        `▸ ${fmt(PLAN.dropAt)} DROP — landed on the steepest meter`,
      ]);
      setPhase("done");
      return;
    }
    if (!audio.current) {
      audio.current = new AudioContext();
    }
    // Autoplay policies can hand back a suspended context even inside a
    // click handler (Safari); resume explicitly or there is silence.
    if (audio.current.state === "suspended") {
      await audio.current.resume();
    }
    fired.current = {};
    nextBeat.current = audio.current.currentTime + 0.1;
    setLog([`▸ onTimerStart → t=0 backdated`]);
    setPhase("playing");
    const begun = performance.now();
    const toReal = (sessionSeconds: number) =>
      (sessionSeconds / DURATION_S) * (REPLAY_MS / 1000);
    const step = (now: number) => {
      const sessionT = Math.min(
        DURATION_S,
        ((now - begun) / REPLAY_MS) * DURATION_S,
      );
      setClock(sessionT);

      // Beat scheduler: soft four-on-the-floor before the drop, double-time
      // with hats after it.
      const ctx = audio.current;
      if (ctx && !mutedRef.current) {
        const afterDrop = sessionT >= PLAN.dropAt;
        const interval = afterDrop ? 0.27 : 0.54;
        while (nextBeat.current < ctx.currentTime + 0.25) {
          kick(ctx, nextBeat.current, afterDrop);
          if (afterDrop) hat(ctx, nextBeat.current + interval / 2);
          nextBeat.current += interval;
        }
      }

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
      fire("cue", PLAN.cueAt, () => {
        setLog((l) => [...l, `▸ ${fmt(PLAN.cueAt)} deck B cued · riser armed`]);
        if (ctx && !mutedRef.current) {
          riser(ctx, ctx.currentTime, toReal(PLAN.dropAt - PLAN.cueAt));
        }
      });
      fire("drop", PLAN.dropAt, () => {
        setLog((l) => [...l, `▸ ${fmt(PLAN.dropAt)} DROP — landed on the steepest meter`]);
        if (ctx && !mutedRef.current) dropHit(ctx, ctx.currentTime);
      });
      if (sessionT >= DURATION_S) {
        setPhase("done");
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const playheadX = x(clock);
  const dropped = clock >= PLAN.dropAt;
  const caption =
    phase === "idle"
      ? "30-second replay of a real-shaped run. Sound on — the drop is the point."
      : [...CAPTIONS].reverse().find((c) => clock >= c.at)?.text ?? "";

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
              onClick={() => {
                mutedRef.current = !mutedRef.current;
                setMuted(mutedRef.current);
              }}
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

      <button
        className="mt-4 border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
        onClick={start}
        disabled={phase === "playing"}
      >
        {phase === "idle" ? "▸ replay a run" : phase === "playing" ? "replaying…" : "▸ replay again"}
      </button>
    </div>
  );
}
