"use client";

import { useEffect, useRef, useState } from "react";
import { kick, hat, riser, dropHit } from "../lib/audio";

const TOTAL_S = 30;
const BUILD_AT = 10;
const DROP_AT = 20;

function verdict(held: number) {
  if (held >= TOTAL_S) return "Full session. You’d survive a Tuesday with me.";
  if (held >= DROP_AT) return "You made the drop, then the sprint got you. Respect.";
  if (held >= BUILD_AT) return "Dropped before the drop. The build breaks most people.";
  return "Warm-up casualty. Shake it out, go again.";
}

function phaseCaption(t: number) {
  if (t < BUILD_AT) return "Easy pace. Settle in.";
  if (t < DROP_AT) return "It builds. Don’t let go.";
  if (t < TOTAL_S) return "DROP — double-time. Hold.";
  return "Done.";
}

const fmt = (s: number) =>
  `0:${String(Math.floor(Math.min(TOTAL_S, s))).padStart(2, "0")}`;

type Phase = "idle" | "holding" | "done";

export default function TrainWithMe() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [t, setT] = useState(0);
  const [held, setHeld] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const raf = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const nextBeat = useRef(0);
  const fired = useRef<{ [k: string]: boolean }>({});
  const holdingRef = useRef(false);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Spacebar works as the hold on desktop.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && phase !== "holding") {
        e.preventDefault();
        begin();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const begin = async () => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    if (!audio.current) audio.current = new AudioContext();
    if (audio.current.state === "suspended") await audio.current.resume();
    fired.current = {};
    nextBeat.current = audio.current.currentTime + 0.1;
    setHeld(null);
    setShared(false);
    setPhase("holding");
    const begun = performance.now();
    const step = (now: number) => {
      if (!holdingRef.current) return;
      const sec = (now - begun) / 1000;
      setT(sec);
      const ctx = audio.current;
      if (ctx) {
        const afterDrop = sec >= DROP_AT;
        const inBuild = sec >= BUILD_AT && !afterDrop;
        const interval = afterDrop ? 0.26 : inBuild ? 0.42 : 0.56;
        while (nextBeat.current < ctx.currentTime + 0.25) {
          kick(ctx, nextBeat.current, afterDrop);
          if (afterDrop || inBuild) hat(ctx, nextBeat.current + interval / 2);
          nextBeat.current += interval;
        }
        if (!fired.current.riser && sec >= DROP_AT - 3) {
          fired.current.riser = true;
          riser(ctx, ctx.currentTime, 3);
        }
        if (!fired.current.drop && afterDrop) {
          fired.current.drop = true;
          dropHit(ctx, ctx.currentTime);
        }
      }
      if (sec >= TOTAL_S) {
        holdingRef.current = false;
        setT(TOTAL_S);
        setHeld(TOTAL_S);
        setPhase("done");
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const release = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    cancelAnimationFrame(raf.current);
    setHeld(t);
    setPhase("done");
  };

  const share = async () => {
    const text = `I held ${fmt(held ?? 0)} of Ethan’s 30-second session. Beat me:`;
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setShared(true);
  };

  const beatS = t >= DROP_AT ? 0.26 : t >= BUILD_AT ? 0.42 : 0.56;

  return (
    <div className="readout mt-8 px-5 py-6 font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-70">
          30-second session · sound on
        </p>
        <span className="tabular-nums">{fmt(t)}</span>
      </div>

      <p className="mt-4 font-sans text-[0.9375rem] text-bone">
        {phase === "idle" &&
          "Hold the button (or the space bar). The music builds, the drop hits at 0:20, then it’s double-time to the end. Let go and it’s over."}
        {phase === "holding" && phaseCaption(t)}
        {phase === "done" && held !== null && (
          <>
            You held <span className="text-phosphor">{fmt(held)}</span>.{" "}
            {verdict(held)}
          </>
        )}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {phase !== "done" ? (
          <button
            className="select-none border border-rule px-10 py-6 uppercase tracking-[0.14em] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
            style={
              phase === "holding"
                ? {
                    borderColor: "var(--phosphor)",
                    animation: `pulse ${beatS}s ease-in-out infinite`,
                  }
                : undefined
            }
            onPointerDown={begin}
            onPointerUp={release}
            onPointerLeave={release}
            onContextMenu={(e) => e.preventDefault()}
          >
            {phase === "holding" ? "hold" : "▸ hold to start"}
          </button>
        ) : (
          <>
            <button
              className="border border-rule px-6 py-3 uppercase tracking-[0.14em] transition-colors hover:border-phosphor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
              onClick={begin}
            >
              ▸ go again
            </button>
            <button
              className="border border-phosphor px-6 py-3 uppercase tracking-[0.14em] text-phosphor transition-colors hover:bg-phosphor hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
              onClick={share}
            >
              {shared ? "copied — send it" : "challenge a friend"}
            </button>
          </>
        )}
      </div>

      {/* Progress rail with drop marker. */}
      <div className="relative mt-6 h-px bg-rule">
        <div
          className="absolute left-0 top-0 h-px bg-phosphor"
          style={{ width: `${(Math.min(t, TOTAL_S) / TOTAL_S) * 100}%` }}
        />
        <span
          className="absolute top-[-3px] h-[7px] w-px bg-dust"
          style={{ left: `${(DROP_AT / TOTAL_S) * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.14em] opacity-50">
        drop at 0:20
      </p>
    </div>
  );
}
