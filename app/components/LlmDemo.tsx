"use client";

import { useEffect, useRef, useState } from "react";

// Training replay: the loss curve draws while the model's output evolves
// from noise to sentences. Checkpoint samples are representative of the
// real build logs from the from-scratch GPT.

const TOTAL_STEPS = 4800;
const REPLAY_MS = 18000;

const CHECKPOINTS: Array<{ step: number; loss: number; sample: string; caption: string }> = [
  { step: 0, loss: 10.31, sample: "vq;tk jj9 zpw&e qq lfx", caption: "A neural net starts knowing nothing. Literally random characters." },
  { step: 600, loss: 6.87, sample: "e t aeo nh t s r he", caption: "It reads text, guesses the next character, gets corrected. Thousands of times a second." },
  { step: 1600, loss: 4.1, sample: "the the and cat the sat", caption: "Watch it discover that words exist…" },
  { step: 3000, loss: 3.02, sample: "the cat sat the mat on and it", caption: "…then that words have an order…" },
  { step: 4800, loss: 2.41, sample: "the cat sat on the mat and looked out at the rain.", caption: "…then grammar. Same mechanism as ChatGPT — built from scratch to earn the right to reason about it." },
];

function lossAt(step: number) {
  // Smooth interpolation through the checkpoints on a log-ish decay.
  for (let i = 1; i < CHECKPOINTS.length; i++) {
    const a = CHECKPOINTS[i - 1], b = CHECKPOINTS[i];
    if (step <= b.step) {
      const f = (step - a.step) / (b.step - a.step);
      return a.loss + (b.loss - a.loss) * f;
    }
  }
  return CHECKPOINTS[CHECKPOINTS.length - 1].loss;
}

const W = 600;
const H = 150;
const LOSS_MAX = 11;

function pt(step: number) {
  // Map loss [0..LOSS_MAX] to y [bottom..top]: high loss draws high.
  const x = (step / TOTAL_STEPS) * W;
  const y = 15 + (1 - lossAt(step) / LOSS_MAX) * (H - 25);
  return { x, y };
}

const CURVE = Array.from({ length: 97 }, (_, i) => {
  const step = (i / 96) * TOTAL_STEPS;
  const { x, y } = pt(step);
  return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");

type Phase = "idle" | "playing" | "done";

export default function LlmDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const start = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(TOTAL_STEPS);
      setPhase("done");
      return;
    }
    setStep(0);
    setPhase("playing");
    const begun = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - begun) / REPLAY_MS);
      // Ease so late training (where the interesting samples live) gets time.
      setStep(Math.round(f * TOTAL_STEPS));
      if (f >= 1) {
        setPhase("done");
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cp = phase === "idle"
    ? CHECKPOINTS[CHECKPOINTS.length - 1]
    : [...CHECKPOINTS].reverse().find((c) => step >= c.step) ?? CHECKPOINTS[0];
  const caption = phase === "idle"
    ? "Press play to watch a GPT learn to read — from random noise to sentences."
    : cp.caption;
  const frac = step / TOTAL_STEPS;

  return (
    <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">
          training replay · representative log
        </p>
        <span className="tabular-nums">step {phase === "idle" ? TOTAL_STEPS : step}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img"
        aria-label="Training loss curve falling from 10.3 to 2.4 over 4800 steps">
        <text x="6" y="18" fill="var(--dust)" fontSize="11">loss</text>
        <path
          d={CURVE}
          fill="none"
          stroke="var(--phosphor)"
          strokeWidth="1.5"
          strokeDasharray="900"
          strokeDashoffset={phase === "idle" ? 0 : 900 - frac * 900}
        />
        {CHECKPOINTS.map((c) => {
          const p = pt(c.step);
          const passed = phase === "idle" || step >= c.step;
          return (
            <g key={c.step}>
              <circle cx={p.x} cy={p.y} r="3" fill={passed ? "var(--phosphor)" : "var(--rule)"} />
              <text x={Math.min(p.x, W - 40)} y={p.y - 8} fill={passed ? "var(--dust)" : "var(--rule)"} fontSize="10">
                {c.loss.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-3 min-h-[3.4em] font-sans text-[0.9375rem] leading-snug text-bone">
        {caption}
      </p>

      <div className="mt-3 min-h-[3.2rem]">
        <p className="opacity-60">sample ▸</p>
        <p className={phase === "playing" ? "cursor text-phosphor" : "text-phosphor"}>
          &ldquo;{cp.sample}&rdquo;
        </p>
      </div>

      <button
        className="mt-4 border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
        onClick={start}
        disabled={phase === "playing"}
      >
        {phase === "idle" ? "▸ train the model" : phase === "playing" ? "training…" : "▸ train again"}
      </button>
    </div>
  );
}
