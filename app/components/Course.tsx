"use client";

import { useEffect, useRef, useState } from "react";

// The page as a route through Ethan's actual life: a GPS-track line draws
// down the left gutter as you scroll, passing his health/fitness hobbies.

const RAIL_W = 96;
const CX = 48;

type Waypoint = { at: number; label: string; icon: React.ReactNode };

// Minimal stroke pictograms, drawn in a 32x32 box centered on the rail.
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

const WAYPOINTS: Waypoint[] = [
  {
    at: 0.07,
    label: "triathlons",
    icon: (
      <g {...stroke}>
        <path d="M16,6 L27,25 L5,25 Z" />
        <circle cx="16" cy="6" r="1.6" />
        <circle cx="27" cy="25" r="1.6" />
        <circle cx="5" cy="25" r="1.6" />
        <path d="M11,21 q3,-2.5 5,0 t5,0" />
      </g>
    ),
  },
  {
    at: 0.18,
    label: "running",
    icon: (
      <g {...stroke}>
        <circle cx="18" cy="8" r="2.5" />
        <path d="M17,11 l-4,6 l4,4 l-1,7 M13,17 l-5,2 M17,15 l6,2 l3,-2" />
      </g>
    ),
  },
  {
    at: 0.29,
    label: "cycling",
    icon: (
      <g {...stroke}>
        <circle cx="9" cy="22" r="5" />
        <circle cx="23" cy="22" r="5" />
        <path d="M9,22 l5,-9 h6 l3,9 M14,13 l-3,0 M19,13 l1,-3 h3" />
      </g>
    ),
  },
  {
    at: 0.4,
    label: "trail running",
    icon: (
      <g {...stroke}>
        <circle cx="14" cy="7" r="2.5" />
        <path d="M13,10 l-3,6 l4,4 l-1,7 M10,16 l-4,2 M14,14 l5,2" />
        <path d="M20,29 l5,-9 l5,9" opacity="0.6" />
      </g>
    ),
  },
  {
    at: 0.51,
    label: "hiking",
    icon: (
      <g {...stroke}>
        <circle cx="15" cy="7" r="2.5" />
        <path d="M15,10 l-2,7 l3,4 l-1,8 M13,17 l-4,3 M16,14 l5,1 l0,14" />
        <path d="M22,29 l8,-12 l2,12" opacity="0.6" />
      </g>
    ),
  },
  {
    at: 0.62,
    label: "skiing",
    icon: (
      <g {...stroke}>
        <circle cx="17" cy="7" r="2.5" />
        <path d="M16,10 l-3,6 l5,4 l-2,6 M13,16 l-4,-2 M18,14 l5,3" />
        <path d="M5,27 l22,0 M7,30 l22,0" />
      </g>
    ),
  },
  {
    at: 0.73,
    label: "cooking",
    icon: (
      <g {...stroke}>
        <circle cx="13" cy="20" r="7" />
        <path d="M20,20 l9,-3" />
        <path d="M9,8 q1.5,2 0,4 M13,7 q1.5,2 0,4 M17,8 q1.5,2 0,4" opacity="0.7" />
      </g>
    ),
  },
  {
    at: 0.84,
    label: "croissants",
    icon: (
      <g {...stroke}>
        <path d="M6,22 q10,-14 20,0" />
        <path d="M6,22 q3,3 7,2 M26,22 q-3,3 -7,2" />
        <path d="M13,24.5 q3,1.5 6,0" />
        <path d="M12,14 l-1.5,-2 M16,12.5 l0,-2.5 M20,14 l1.5,-2" opacity="0.6" />
      </g>
    ),
  },
  {
    at: 0.95,
    label: "finish — say hi",
    icon: (
      <g {...stroke}>
        <path d="M10,5 v24" />
        <path d="M10,5 h14 l-3,4 l3,4 h-14" />
        <path d="M13,6 v6 M17,6 v6 M21,6 v6" opacity="0.5" />
      </g>
    ),
  },
];

function buildPath(height: number) {
  // Gentle GPS wander: cubic segments alternating around the rail center.
  const seg = 320;
  const n = Math.max(2, Math.ceil(height / seg));
  let d = `M${CX},64`;
  for (let i = 0; i < n; i++) {
    const y0 = 64 + i * seg;
    const y1 = Math.min(height, 64 + (i + 1) * seg);
    if (y0 >= height) break;
    const dir = i % 2 === 0 ? 1 : -1;
    const bend = 14 * dir;
    d += ` C${CX + bend},${y0 + seg * 0.33} ${CX - bend},${Math.max(y0, y1 - seg * 0.33)} ${CX},${y1}`;
  }
  return d;
}

export default function Course() {
  const [height, setHeight] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const measure = () => setHeight(document.documentElement.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        // Finish the course slightly before absolute bottom so the flag lights.
        setProgress(max > 0 ? Math.min(1, (window.scrollY / max) * 1.06) : 1);
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [height]);

  if (height === 0) {
    return <div aria-hidden="true" className="hidden xl:block" />;
  }

  const shown = reduced ? 1 : progress;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 hidden h-full xl:block"
      style={{ width: RAIL_W }}
    >
      <svg width={RAIL_W} height={height} className="absolute left-0 top-0">
        <text
          x={CX}
          y="18"
          textAnchor="middle"
          fill="var(--dust)"
          fontSize="8"
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
        >
          <tspan x={CX} dy="0">ETHAN&apos;S</tspan>
          <tspan x={CX} dy="11">HEALTH/FITNESS</tspan>
          <tspan x={CX} dy="11">HOBBIES</tspan>
        </text>
        <path
          d={buildPath(height)}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          ref={pathRef}
          d={buildPath(height)}
          fill="none"
          stroke="var(--phosphor)"
          strokeWidth="1.5"
          strokeDasharray={pathLen || 1}
          strokeDashoffset={(pathLen || 1) * (1 - shown)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
        {WAYPOINTS.map((w) => {
          const passed = shown >= w.at;
          const y = Math.max(90, w.at * height);
          return (
            <g
              key={w.label}
              transform={`translate(${CX - 16},${y - 16})`}
              color={passed ? "var(--phosphor)" : "var(--rule)"}
              style={{ transition: "color 400ms ease" }}
            >
              <circle cx="16" cy="16" r="22" fill="var(--night)" stroke="none" />
              {w.icon}
              <text
                x="16"
                y="44"
                textAnchor="middle"
                fill={passed ? "var(--dust)" : "var(--rule)"}
                fontSize="9"
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
                style={{ transition: "fill 400ms ease" }}
              >
                {w.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
