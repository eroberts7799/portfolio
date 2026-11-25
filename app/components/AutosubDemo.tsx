"use client";

import { useEffect, useRef, useState } from "react";

// Replay of the last ten minutes before a Sunday 1:00 kickoff, following the
// real decision order in espn_autosub.py. Players and numbers are invented.

type Player = { id: string; slot: string; name: string; pos: string; proj: number };

const STARTERS: Player[] = [
  { id: "marsh", slot: "QB", name: "D. Marsh", pos: "QB", proj: 18.2 },
  { id: "okafor", slot: "RB", name: "T. Okafor", pos: "RB", proj: 14.6 },
  { id: "reyes", slot: "RB", name: "J. Reyes", pos: "RB", proj: 11.9 },
  { id: "whitlock", slot: "WR", name: "C. Whitlock", pos: "WR", proj: 15.1 },
  { id: "banks", slot: "WR", name: "A. Banks", pos: "WR", proj: 12.8 },
  { id: "dorsey", slot: "TE", name: "M. Dorsey", pos: "TE", proj: 9.4 },
  { id: "vance", slot: "FLEX", name: "R. Vance", pos: "RB", proj: 10.7 },
];

const BENCH: Player[] = [
  { id: "ibarra", slot: "BE", name: "K. Ibarra", pos: "WR", proj: 13.0 },
  { id: "hale", slot: "BE", name: "S. Hale", pos: "WR", proj: 11.4 },
  { id: "pruitt", slot: "BE", name: "N. Pruitt", pos: "RB", proj: 9.8 },
  { id: "castell", slot: "BE", name: "L. Castell", pos: "WR", proj: 0.0 },
];

// Steps: 0 = 12:50 check, 1 = scratch spotted, 2 = bench evaluated,
// 3 = swap made, 4 = text sent.
const STEP_MS = [2200, 3000, 3000, 2000];
const LAST = STEP_MS.length;

const CAPTIONS = [
  "Ten minutes before kickoff a timer on my server wakes the script. Everyone is healthy, so it says nothing.",
  "Two minutes out a starter is ruled out. The fantasy app still says questionable, but the public injury report has flipped.",
  "It checks the bench: right position for that slot, healthy, game not started. Highest projection wins.",
  "It makes the swap before the lineup locks.",
  "Then it texts me what it did and why. If anything is uncertain it changes nothing and tells me instead.",
];

const LOG: Array<{ step: number; time: string; who: string; text: string }> = [
  { step: 0, time: "12:50", who: "check", text: "7 starters, none out. silent." },
  { step: 1, time: "12:58", who: "fantasy tag", text: "Banks QUESTIONABLE" },
  { step: 1, time: "12:58", who: "injury report", text: "Banks OUT (hamstring)" },
  { step: 3, time: "12:58", who: "swap", text: "Hale in for Banks at WR" },
  { step: 4, time: "12:58", who: "text", text: "Hale (proj 11.4) in for Banks at WR. Injury report says out, tag still questionable." },
];

type Tone = "plain" | "bad" | "good" | "dim";

function note(id: string, step: number): { text: string; tone: Tone } {
  if (id === "banks") {
    return step >= 1 ? { text: "out", tone: "bad" } : { text: "questionable", tone: "plain" };
  }
  if (id === "castell") return { text: "out", tone: "dim" };
  if (step >= 2) {
    if (id === "ibarra") return { text: "locked (thu)", tone: "dim" };
    if (id === "pruitt") return { text: "not a WR", tone: "dim" };
    if (id === "hale") return { text: step >= 3 ? "subbed in" : "best fit", tone: "good" };
  }
  return { text: "", tone: "plain" };
}

const TONE_CLASS: Record<Tone, string> = {
  plain: "",
  bad: "text-signal",
  good: "text-phosphor font-semibold",
  dim: "opacity-50",
};

type Phase = "idle" | "playing" | "done";

export default function AutosubDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const start = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(LAST);
      setPhase("done");
      return;
    }
    setStep(0);
    setPhase("playing");
    let s = 0;
    const next = () => {
      timer.current = setTimeout(() => {
        s += 1;
        setStep(s);
        if (s >= LAST) setPhase("done");
        else next();
      }, STEP_MS[s]);
    };
    next();
  };

  const swapped = step >= 3;
  const banks = STARTERS.find((p) => p.id === "banks")!;
  const hale = BENCH.find((p) => p.id === "hale")!;
  const starters = STARTERS.map((p) => (swapped && p.id === "banks" ? { ...hale, slot: "WR" } : p));
  const bench = BENCH.map((p) => (swapped && p.id === "hale" ? { ...banks, slot: "BE" } : p));

  const caption = phase === "idle"
    ? "Press play to replay the last ten minutes before a 1:00 kickoff."
    : CAPTIONS[step];

  const row = (p: Player) => {
    const n = note(p.id, step);
    const rowTone = p.id === "banks" && step >= 1 ? "text-signal" : p.id === "hale" && step >= 2 ? "text-phosphor" : "";
    return (
      <li key={p.id} className={`grid grid-cols-[2.75rem_1fr_auto_2.5rem] gap-x-2 ${rowTone}`}>
        <span className="opacity-50">{p.slot}</span>
        <span className="truncate">
          {p.name}
          {p.slot === "BE" && <span className="opacity-50"> {p.pos}</span>}
        </span>
        <span className={TONE_CLASS[n.tone]}>{n.text}</span>
        <span className="text-right tabular-nums">{p.proj.toFixed(1)}</span>
      </li>
    );
  };

  return (
    <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">
          replay · invented players
        </p>
        <span className="tabular-nums">{step >= 1 ? "12:58" : "12:50"} ET</span>
      </div>

      <p className="mt-3 min-h-[4.2em] font-sans text-[0.9375rem] leading-snug text-bone">
        {caption}
      </p>

      <ul className="mt-3">{starters.map(row)}</ul>
      <ul className="mt-2 border-t border-rule pt-2">{bench.map(row)}</ul>

      <div className="mt-3 min-h-[8.5rem] border-t border-rule pt-2" aria-live="polite">
        {LOG.filter((l) => l.step <= step).map((l) => (
          <p key={l.who + l.text.slice(0, 8)}>
            <span className="opacity-50">{l.time}</span>{" "}
            <span className="text-phosphor">{l.who}</span> ▸ {l.text}
          </p>
        ))}
      </div>

      <button
        className="mt-4 border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
        onClick={start}
        disabled={phase === "playing"}
      >
        {phase === "idle" ? "▸ replay a sunday" : phase === "playing" ? "replaying…" : "▸ replay again"}
      </button>
    </div>
  );
}
