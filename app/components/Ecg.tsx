"use client";

import { useEffect, useState } from "react";

// One PQRST complex, 150 units wide, drawn left-to-right.
const COMPLEX =
  "M0,30 L40,30 L48,26 L56,30 L66,30 L70,34 L76,4 L82,44 L88,30 L104,30 L114,24 L124,30 L150,30";

export default function Ecg({ bpm, syncedDate }: { bpm: number; syncedDate: string }) {
  const beatS = 60 / bpm;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const status = `Real numbers, synced ${syncedDate} from my watch. Daily aggregates only — the rest stays between me and it.`;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <svg
        viewBox="0 0 450 60"
        className="h-10 w-full max-w-md"
        role="img"
        aria-label={`Electrocardiogram trace beating at ${bpm} beats per minute — a resting morning from Ethan's log`}
      >
        <g
          stroke="var(--phosphor)"
          strokeWidth="1.5"
          fill="none"
          style={
            reduced ? undefined : { animation: `ecg-beat ${beatS}s ease-out infinite` }
          }
        >
          <path d={COMPLEX} />
          <path d={COMPLEX} transform="translate(150,0)" />
          <path d={COMPLEX} transform="translate(300,0)" />
        </g>
      </svg>
      <p className="whitespace-nowrap font-mono text-[0.8125rem] text-phosphor">
        <span
          className="signal-dot mr-2"
          style={{ animationDuration: `${beatS}s` }}
          aria-hidden="true"
        />
        {bpm} bpm resting
      </p>
      <p className="w-full font-mono text-[0.8125rem] text-dust">{status}</p>
    </div>
  );
}
