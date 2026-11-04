// Single source of truth for the site's content and navigation.

export const site = {
  name: "Ethan Roberts",
  url: "https://ethanroberts.dev",
  bio: "I do partnerships at CET Sandbox in Tel Aviv and build fitness products on the side.",
  email: "eroberts7799@gmail.com",
  github: "https://github.com/eroberts7799",
  resume:
    "https://docs.google.com/document/d/1-icQWbufuI-crBPaI88yzBOv45khEggSWBXQxw7kidg/edit?usp=sharing",
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  demo: "awdj" | "coach" | "llm";
  body: string[];
  stack: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "awdj",
    title: "AI DJ for Running",
    description: "Music that anticipates the hill",
    demo: "awdj",
    body: [
      "Most music apps react to what you’re doing. This one plans ahead. The engine reads your heart rate, GPS, and the structure of the workout you planned, and times the drop to hit when the hill or the interval starts.",
      "The run streams off a Garmin watch in real time through a Connect IQ data field. The core logic is written in TypeScript and ported line for line to Swift for the iOS app. A parity suite replays real sessions to make sure both versions behave the same. Every change to the engine gets checked by a critic that renders the actual audio and judges it before it ships.",
    ],
    stack: [
      "TypeScript",
      "Swift",
      "Monkey C (Garmin)",
      "Spotify + Strava APIs",
      "Audio DSP",
      "Vercel",
    ],
    links: [
      { label: "Source", href: "https://github.com/eroberts7799/ai-workout-dj" },
      {
        label: "Garmin Connect IQ",
        href: "https://apps.garmin.com/apps/ac986a1c-0f2b-4ea0-88d5-a9320d29195f",
      },
    ],
  },
  {
    slug: "coach",
    title: "Health Coach",
    description: "An agent that texts me first",
    demo: "coach",
    body: [
      "Every morning at 6:05 an agent reads how I slept, the real sleep stages, resting heart rate, and training load off my watch. It checks my training plan and the weather in Tel Aviv, then texts me what to eat and when.",
      "The Garmin data goes into a local SQLite database, which is the system of record. An agent running on my own server writes the morning briefing and answers questions I throw at it during the day, using the actual numbers. Meal logs sync between my machines through git. The ingest layer isn’t tied to one device; it handles both Garmin and the WHOOP v2 API.",
    ],
    stack: ["Python", "SQLite", "LLM agent", "Telegram", "Garmin + WHOOP v2 API"],
    links: [{ label: "Source", href: "https://github.com/eroberts7799/health-tracker" }],
  },
  {
    slug: "llm",
    title: "LLM from scratch",
    description: "A GPT built to understand, not to ship",
    demo: "llm",
    body: [
      "A GPT built from first principles, tokenizer, attention, training loop, all of it, trained on a corpus of health facts, then supervised-fine-tuned into a small chat model. No frameworks doing the thinking.",
      "Written as an explain-it-simply series: every mechanism gets a working implementation and a plain-language account of why it exists. The point wasn’t the model; it was earning the right to reason about the tools I use every day.",
    ],
    stack: ["Python", "PyTorch", "Tokenization → attention → SFT"],
    links: [{ label: "Source", href: "https://github.com/eroberts7799/llm-from-scratch" }],
  },
];

export const pageTitles: Record<string, string> = {
  "/about": "About",
  "/newsletter": "Defense Tech Newsletter",
  ...Object.fromEntries(projects.map((p) => [`/${p.slug}`, p.title])),
};
