import { ImageResponse } from "next/og";
import vitals from "../data/vitals.json";

// Link-preview card: the site's night-ops palette, name, tagline, and the
// ECG trace at the top of the page. Rendered at build time by Next.

export const alt = "Ethan Roberts — I build the software I want to live with";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#0F110B";
const BONE = "#E4E1D4";
const DUST = "#8D9181";
const PHOSPHOR = "#A8B66A";
const RULE = "#262A1D";

// Satori needs raw font bytes; next/font can't hand those over, so the two
// display faces are fetched from Google Fonts at build time.
async function loadFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

// One PQRST beat, repeated across the card width.
function ecgPath(width: number, y: number, beats: number) {
  const w = width / beats;
  let d = `M0,${y}`;
  for (let i = 0; i < beats; i++) {
    const x = i * w;
    d +=
      ` L${x + w * 0.2},${y}` +
      ` q${w * 0.04},-8 ${w * 0.08},0` +
      ` L${x + w * 0.38},${y}` +
      ` l${w * 0.03},6 l${w * 0.04},-52 l${w * 0.04},64 l${w * 0.03},-18` +
      ` L${x + w * 0.62},${y}` +
      ` q${w * 0.06},-14 ${w * 0.12},0` +
      ` L${x + w},${y}`;
  }
  return d;
}

export default async function OpenGraphImage() {
  const [font, serif] = await Promise.all([
    loadFont("Big+Shoulders:wght@700"),
    loadFont("Instrument+Serif:ital@1"),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NIGHT,
          color: BONE,
          padding: "64px 72px",
          fontFamily: font ? "Big Shoulders" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 22,
            color: DUST,
            letterSpacing: 2,
          }}
        >
          <span>ethan.roberts — tel aviv → boston, nov 2026</span>
          <span style={{ color: PHOSPHOR }}>resting.hr {vitals.restingHr} bpm</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 118,
              fontWeight: 700,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            I build the software
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 118, fontWeight: 700, lineHeight: 0.95, letterSpacing: 1 }}>
            <span style={{ textTransform: "uppercase" }}>I want</span>
            <span
              style={{
                marginLeft: 28,
                fontFamily: serif ? "Instrument Serif" : "serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 104,
                color: PHOSPHOR,
              }}
            >
              to live with.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <svg width={1056} height={90} viewBox="0 0 1056 90">
            <path d={ecgPath(1056, 52, 4)} fill="none" stroke={PHOSPHOR} strokeWidth={2.5} strokeLinejoin="round" />
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${RULE}`,
              paddingTop: 18,
              fontFamily: "monospace",
              fontSize: 20,
              color: DUST,
              letterSpacing: 2,
            }}
          >
            <span>AI WORKOUT DJ · HEALTH COACH · LLM FROM SCRATCH</span>
            <span>real, running, and mine</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(font
          ? [{ name: "Big Shoulders", data: font, weight: 700 as const, style: "normal" as const }]
          : []),
        ...(serif
          ? [{ name: "Instrument Serif", data: serif, weight: 400 as const, style: "italic" as const }]
          : []),
      ],
    },
  );
}
