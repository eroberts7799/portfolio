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
  demo: "awdj" | "coach" | "llm" | "autosub" | "airadar" | "raises";
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
  {
    slug: "autosub",
    title: "Fantasy Auto-Sub",
    description: "Benches the injured starter before kickoff",
    demo: "autosub",
    body: [
      "Fantasy lineups lock at kickoff, and NFL teams often rule players out in the last hour before it. I live in Tel Aviv, where the Sunday night game starts after 3 a.m. So I wrote a script that checks my lineup a few minutes before each kickoff window and benches anyone who isn’t going to play.",
      "It reads two separate ESPN feeds: the injury tag in the fantasy app and the public injury report, which sometimes updates first. A starter gets pulled if he’s officially out, if the injury report says out while the tag still says questionable, or if his projection has dropped to about zero. The replacement is the highest-projected bench player who fits that exact slot, is healthy, and whose game hasn’t started.",
      "It runs on a timer on my own server and stays silent unless it acts. When it makes a swap it texts me what it did and why. If anything is uncertain, like an expired login or no valid replacement, it changes nothing and tells me.",
    ],
    stack: ["Python (standard library only)", "ESPN fantasy API (unofficial)", "systemd timers", "Telegram"],
    links: [],
  },
  {
    slug: "ai-radar",
    title: "AI Radar",
    description: "One to three AI tools worth trying, every morning",
    demo: "airadar",
    body: [
      "Every morning at 9 an agent emails me one to three AI tools or features from the last day or two. The bar is that a power user would drop what they’re doing to try it today. On a quiet day it sends one item and doesn’t pad.",
      "It searches launch announcements, changelogs, Product Hunt and Hacker News, plus whatever AI Twitter is talking about, and only includes things it can confirm with a link. Each item says what it is, why I specifically should care, and which competitor already ships something similar, or that nobody does.",
      "There’s no code. It’s one prompt running on a schedule in the cloud, with web search and a Gmail connection. The work was in the prompt: it carries a profile of what I’m building, so the “why you care” line is about my projects and not generic hype. It has run daily since September 2026.",
    ],
    stack: ["Claude scheduled task (cloud)", "Claude Sonnet", "Web search", "Gmail"],
    links: [],
  },
  {
    slug: "fundraising-radar",
    title: "Fundraising Radar",
    description: "Boston startups that just raised",
    demo: "raises",
    body: [
      "Boston is home, and I want to know which new health companies there just raised money. Every night an agent finds Boston area startups, health tech first plus defense and dual-use, that announced a pre-seed through Series B round in the last 90 days. The new ones land in my morning email.",
      "It runs in two stages. At 3:30 a.m. an agent on my Mac reads the funding press, accelerator and investor portfolio pages, and SEC filings when the news is thin. It has to open each announcement to confirm the date before it can include a raise. Then a plain Python script checks the agent’s work and drops any startup without a headquarters or verified office in the Boston metro.",
      "What survives merges into a running radar file that keeps the date each startup was first seen and my own status notes, which the agent can never overwrite. A second agent in the cloud reads the file and sends the email, flagging anything announced in the last two weeks. It has run since September 2026 and had 29 startups on it as of late November.",
    ],
    stack: ["Claude Code (headless)", "Python", "launchd", "Claude scheduled task (cloud)", "Gmail"],
    links: [],
  },
];

export const pageTitles: Record<string, string> = {
  "/about": "About",
  "/newsletter": "Defense Tech Newsletter",
  ...Object.fromEntries(projects.map((p) => [`/${p.slug}`, p.title])),
};
