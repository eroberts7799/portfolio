"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "$ boot --profile ethan",
  "▸ garmin.hr ......... 162 bpm",
  "▸ drop.scheduled .... 03:12",
  "▸ sleep.score ....... 91 · briefing 06:05",
  "▸ training.loss ..... 2.41 ↓",
  "ready.",
];

const CHAR_MS = 18;
const LINE_PAUSE_MS = 220;

export default function BootLog() {
  const [done, setDone] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const [finished, setFinished] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setDone(LINES);
      setFinished(true);
      return;
    }
    let line = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (line >= LINES.length) {
        setFinished(true);
        return;
      }
      const current = LINES[line];
      if (char < current.length) {
        char += 1;
        setTyping(current.slice(0, char));
        timer = setTimeout(tick, CHAR_MS);
      } else {
        setDone((d) => [...d, current]);
        setTyping("");
        line += 1;
        char = 0;
        timer = setTimeout(tick, LINE_PAUSE_MS);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-label="Boot log: live telemetry from Ethan's systems"
      className="font-mono text-[0.8125rem] leading-relaxed text-phosphor sm:text-sm"
    >
      {done.map((l) => (
        <p key={l} className={l === "ready." && finished ? "cursor" : undefined}>
          {l}
        </p>
      ))}
      {typing && <p className="cursor">{typing}</p>}
      {/* Reserve height so later lines don't shift the page as they type. */}
      {!finished &&
        Array.from({ length: LINES.length - done.length - (typing ? 1 : 0) }).map(
          (_, i) => <p key={i}>&nbsp;</p>,
        )}
    </div>
  );
}
