"use client";

import { useEffect, useRef, useState } from "react";

// Replay of a morning briefing, shaped like the real 06:05 Telegram texts.
// Representative content — the real feed stays between Ethan and his coach.

type Line = { who: "coach" | "ethan"; time: string; text: string; pauseBefore: number };

const SCRIPT: Line[] = [
  { who: "coach", time: "06:05", text: "Morning. Sleep 7.9h (score 93), resting 48 — you're recovered.", pauseBefore: 400 },
  { who: "coach", time: "06:05", text: "Leg day at 07:30. Feels-like 27° by then — salt your water.", pauseBefore: 700 },
  { who: "coach", time: "06:05", text: "Eat by 06:45: oats, eggs, banana. Don't lift fasted today.", pauseBefore: 700 },
  { who: "ethan", time: "06:41", text: "can i swap squats for intervals?", pauseBefore: 1600 },
  { who: "coach", time: "06:41", text: "No. HRV says lift heavy while you're fresh — intervals Thursday. You'll thank me.", pauseBefore: 900 },
];

const CAPTIONS: Array<{ afterLine: number; text: string }> = [
  { afterLine: -1, text: "Every morning at 6:05, an agent reads the night from the watch — and texts first." },
  { afterLine: 2, text: "No dashboard, no app to open. Breakfast instructions before the alarm's second snooze." },
  { afterLine: 3, text: "And it answers back — grounded in the actual numbers, not vibes." },
];

const CHAR_MS = 22;

type Phase = "idle" | "playing" | "done";

export default function CoachDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState<Line[]>([]);
  const [typing, setTyping] = useState<{ who: string; time: string; text: string } | null>(null);
  const [capIdx, setCapIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const start = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(SCRIPT);
      setCapIdx(CAPTIONS.length - 1);
      setPhase("done");
      return;
    }
    setDone([]);
    setTyping(null);
    setCapIdx(0);
    setPhase("playing");
    let li = 0;
    const nextLine = () => {
      if (li >= SCRIPT.length) {
        setPhase("done");
        return;
      }
      const line = SCRIPT[li];
      timer.current = setTimeout(() => {
        let ci = 0;
        const typeChar = () => {
          ci += 1;
          setTyping({ who: line.who, time: line.time, text: line.text.slice(0, ci) });
          if (ci < line.text.length) {
            timer.current = setTimeout(typeChar, CHAR_MS);
          } else {
            setDone((d) => [...d, line]);
            setTyping(null);
            const cap = CAPTIONS.findIndex((c) => c.afterLine === li);
            if (cap >= 0) setCapIdx(cap);
            li += 1;
            nextLine();
          }
        };
        typeChar();
      }, line.pauseBefore);
    };
    nextLine();
  };

  const caption = phase === "idle"
    ? "The coach that texts first. Press play to replay one morning."
    : CAPTIONS[capIdx].text;

  const renderLine = (l: { who: string; time: string; text: string }, cursor: boolean) => (
    <p key={l.time + l.text.slice(0, 12)} className={l.who === "ethan" ? "text-dust" : undefined}>
      <span className="opacity-50">{l.time}</span>{" "}
      <span className={l.who === "coach" ? "text-phosphor" : undefined}>
        {l.who === "coach" ? "coach" : "ethan"}
      </span>{" "}
      ▸ <span className={cursor ? "cursor" : undefined}>{l.text}</span>
    </p>
  );

  return (
    <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">
          morning briefing · representative data
        </p>
        <span className="tabular-nums">06:05</span>
      </div>

      <p className="mt-3 min-h-[3.4em] font-sans text-[0.9375rem] leading-snug text-bone">
        {caption}
      </p>

      <div className="mt-3 min-h-[9.5rem]">
        {phase === "idle" ? (
          <>
            <p><span className="opacity-50">06:05</span> <span className="text-phosphor">coach</span> ▸ sleep 7.5h (91)</p>
            <p><span className="opacity-50">06:05</span> <span className="text-phosphor">coach</span> ▸ leg day · feels-like 27°</p>
            <p className="cursor"><span className="opacity-50">06:05</span> <span className="text-phosphor">coach</span> ▸ eat by 06:45</p>
          </>
        ) : (
          <>
            {done.map((l) => renderLine(l, false))}
            {typing && renderLine(typing, true)}
          </>
        )}
      </div>

      <button
        className="mt-4 border border-rule px-4 py-2 uppercase tracking-[0.14em] text-[0.6875rem] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
        onClick={start}
        disabled={phase === "playing"}
      >
        {phase === "idle" ? "▸ replay a morning" : phase === "playing" ? "replaying…" : "▸ replay again"}
      </button>
    </div>
  );
}
