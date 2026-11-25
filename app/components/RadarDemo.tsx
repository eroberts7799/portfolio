"use client";

import { useEffect, useRef, useState } from "react";

// Replay of one morning's run for the two email radars. The pipeline steps
// follow the real prompts and scripts; the companies, tools and counts in the
// replay are invented.

type Step = { time: string; who: string; text: string; caption: string };
type Item = { title: string; lines: Array<{ label?: string; text: string }> };
type Variant = {
  label: string;
  clock: string;
  idle: string;
  done: string;
  button: string;
  steps: Step[];
  subject: string;
  items: Item[];
};

const VARIANTS: Record<"airadar" | "raises", Variant> = {
  airadar: {
    label: "morning replay · invented example",
    clock: "09:00",
    idle: "Press play to replay one morning's run.",
    done: "One item cleared the bar today, so the email has one item.",
    button: "replay a morning",
    steps: [
      { time: "09:00", who: "search", text: "launches and changelogs, last 48 hours", caption: "At 9:00 a scheduled agent starts from nothing and searches what shipped in the last day or two." },
      { time: "09:01", who: "search", text: "what AI Twitter is talking about", caption: "It can't browse X directly, so it finds the buzz through roundups and press that quote the posts." },
      { time: "09:01", who: "verify", text: "9 candidates, 4 confirmed with a source", caption: "Anything it can't confirm with a link is dropped." },
      { time: "09:02", who: "pick", text: "1 worth trying today", caption: "The bar: would a power user drop what they're doing to try this today? Most days, most things fail it." },
      { time: "09:02", who: "compare", text: "found a comparable product", caption: "For each pick it looks for a competitor that already ships something similar, and says so if there isn't one." },
      { time: "09:02", who: "send", text: "email sent", caption: "Then it writes the email and sends it." },
    ],
    subject: "AI Radar — November 12, 2026",
    items: [
      {
        title: "1. Fieldnote Replay",
        lines: [
          { text: "A coding agent that records every step of a run and lets you rewind to any point and branch from there." },
          { label: "Why you care:", text: "your health coach runs unattended overnight. This is how you'd see where a bad morning briefing went wrong." },
          { label: "Similar to:", text: "Northwind's Trace view. Same idea, but that one is read-only." },
        ],
      },
    ],
  },
  raises: {
    label: "overnight replay · invented example",
    clock: "03:30",
    idle: "Press play to replay one night's run.",
    done: "One new startup today. Anything announced in the last two weeks gets flagged.",
    button: "replay a night",
    steps: [
      { time: "03:30", who: "discover", text: "funding press, rounds from the last 90 days", caption: "At 3:30 a.m. an agent on my Mac reads the funding press, accelerator pages and investor portfolios." },
      { time: "03:44", who: "verify", text: "opened 7 announcements", caption: "It has to open each announcement and confirm the date before it can include a raise." },
      { time: "03:52", who: "filter", text: "dropped 1, no Boston office", caption: "Then a plain script checks the agent's work. No headquarters or verified office in the Boston metro: dropped." },
      { time: "03:52", who: "merge", text: "6 kept, 1 new on the radar", caption: "The rest merge into a running file that remembers when each startup was first seen, and keeps my notes." },
      { time: "later", who: "send", text: "email sent", caption: "A second agent in the cloud reads that file and sends the morning email." },
    ],
    subject: "Boston raises — 1 new",
    items: [
      {
        title: "Tidewell Health · Seed · $5M · Cambridge, MA",
        lines: [
          { text: "Sleep coaching that reads your wearable data and adjusts the plan each week." },
          { label: "Fresh:", text: "announced 6 days ago." },
        ],
      },
    ],
  },
};

const STEP_MS = 2400;

type Phase = "idle" | "playing" | "done";

export default function RadarDemo({ variant }: { variant: "airadar" | "raises" }) {
  const v = VARIANTS[variant];
  const last = v.steps.length - 1;
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(last);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const start = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(last);
      setPhase("done");
      return;
    }
    setStep(0);
    setPhase("playing");
    let s = 0;
    const next = () => {
      timer.current = setTimeout(() => {
        if (s >= last) {
          setPhase("done");
          return;
        }
        s += 1;
        setStep(s);
        next();
      }, STEP_MS);
    };
    next();
  };

  const caption = phase === "idle" ? v.idle : phase === "done" ? v.done : v.steps[step].caption;
  const emailShown = phase !== "playing";

  return (
    <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">{v.label}</p>
        <span className="tabular-nums">{phase === "playing" ? v.steps[step].time : v.clock}</span>
      </div>

      <p className="mt-3 min-h-[4.2em] font-sans text-[0.9375rem] leading-snug text-bone">
        {caption}
      </p>

      <div className="mt-3" aria-live="polite">
        {v.steps.map((s, i) => (
          <p key={s.who + s.text} className={i <= step ? undefined : "invisible"}>
            <span className="opacity-50">{s.time}</span>{" "}
            <span className="text-phosphor">{s.who}</span> ▸ {s.text}
          </p>
        ))}
      </div>

      <div
        className={`mt-3 border-t border-rule pt-3 font-sans text-[0.9375rem] leading-snug transition-opacity duration-500 ${
          emailShown ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!emailShown}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">inbox</p>
        <p className="mt-1 font-semibold text-bone">{v.subject}</p>
        {v.items.map((it) => (
          <div key={it.title} className="mt-3 flex flex-col gap-1.5">
            <p className="font-semibold text-bone">{it.title}</p>
            {it.lines.map((l) => (
              <p key={l.text.slice(0, 16)}>
                {l.label && <span className="font-medium text-bone">{l.label} </span>}
                {l.text}
              </p>
            ))}
          </div>
        ))}
      </div>

      <button
        className="mt-4 border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
        onClick={start}
        disabled={phase === "playing"}
      >
        {phase === "playing" ? "replaying…" : phase === "idle" ? `▸ ${v.button}` : "▸ replay again"}
      </button>
    </div>
  );
}
