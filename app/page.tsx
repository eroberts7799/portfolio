import BootLog from "./components/BootLog";
import AwdjDemo from "./components/AwdjDemo";
import Ecg from "./components/Ecg";
import vitals from "../data/vitals.json";

const bootLines = [
  "$ boot --profile ethan",
  `▸ resting.hr ........ ${vitals.restingHr} bpm`,
  `▸ sleep ............. ${vitals.sleep.hours}h (${vitals.sleep.score})`,
  `▸ plan .............. ${vitals.plan} · feels-like ${vitals.feelsLikeC}°`,
  `▸ briefing.sent ..... ${vitals.briefingAt}`,
  "ready.",
];

const projects = [
  {
    log: "LOG/01 · runs on my wrist",
    title: "AI Workout DJ",
    demo: true,
    readout: [
      "onTimerStart → t=0 backdated",
      "HR 162 → drop scheduled 03:12",
      "deck B cued ▸ armed",
    ],
    body: [
      "Music apps react. This one anticipates: a deterministic choreography engine reads live heart rate, GPS, and the structure of a planned workout, and lands the drop at the moment the hill does.",
      "A Garmin Connect IQ field streams the run off the watch in real time; a TypeScript conductor is the source of truth, ported line-for-line to Swift for iOS with a parity suite replaying real sessions. Engine changes ship with a verdict from a critic that renders and judges actual audio — not vibes.",
    ],
    stack: "TypeScript · Swift · Monkey C (Garmin) · audio DSP · Vercel",
  },
  {
    log: "LOG/02 · texts me first",
    title: "Health Coach",
    readout: [
      "06:05 → sleep 7.5h (91)",
      "leg day · feels-like 27°",
      "eat by 06:45 ▸ sent",
    ],
    body: [
      "Every morning at 6:05 an agent reads my night — real sleep stages, resting HR, training load from my watch — checks my training plan and the Tel Aviv weather, and texts me exactly what to eat and when. I never open a dashboard.",
      "Garmin data flows into a local SQLite system of record; an always-on agent on my own server writes the briefings and answers ad-hoc questions grounded in the actual numbers. Meal logs sync between machines through git. Built in a weekend, coaching me daily since.",
    ],
    stack: "Python · SQLite · LLM agent · Telegram · self-hosted",
  },
  {
    log: "LOG/03 · built to understand",
    title: "LLM from scratch",
    readout: [
      "step 4800 · loss 2.41 ↓",
      'sample: "the cat sat on',
      'the mat and" ▸ coherent',
    ],
    body: [
      "A GPT built from first principles — tokenizer, attention, training loop, all of it — then supervised-fine-tuned into a small chat model. No frameworks doing the thinking.",
      "Written as an explain-it-simply series: every mechanism gets a working implementation and a plain-language account of why it exists. The point wasn’t the model; it was earning the right to reason about the tools I use every day.",
    ],
    stack: "Python · PyTorch · tokenization → attention → SFT",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Nav */}
      <header className="flex items-center justify-between py-6 font-mono text-[0.8125rem]">
        <p className="text-bone">
          <span className="signal-dot mr-2 align-middle" aria-hidden="true" />
          ethan.roberts — tel aviv
        </p>
        <nav className="flex items-center gap-6">
          <a
            className="hidden text-dust transition-colors hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor sm:inline"
            href="#work"
          >
            work
          </a>
          <a
            className="hidden text-dust transition-colors hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor sm:inline"
            href="#currently"
          >
            currently
          </a>
          <a
            className="border border-rule px-4 py-2 text-bone transition-colors hover:border-phosphor hover:text-phosphor focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor"
            href="mailto:eroberts799@gmail.com"
          >
            get in touch
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="pt-16 sm:pt-24">
          <BootLog lines={bootLines} />
          <h1
            className="rise mt-10 font-display text-[3.5rem] font-bold uppercase leading-[0.95] tracking-[0.01em] sm:text-[6rem]"
            style={{ animationDelay: "800ms" }}
          >
            I build the software
            <br />
            I want{" "}
            <em className="font-serif normal-case italic tracking-normal text-phosphor">
              to live with.
            </em>
          </h1>
          <p
            className="rise mt-8 max-w-xl text-dust"
            style={{ animationDelay: "1000ms" }}
          >
            By day I invest in defense technology at CET Sandbox. The rest of
            the time I ship systems that run my actual life — on my wrist, my
            phone, and a server that texts me before I wake up. Everything
            below is real, running, and mine.
          </p>
          <div className="rise mt-10" style={{ animationDelay: "1200ms" }}>
            <Ecg bpm={vitals.restingHr} />
          </div>
        </section>

        {/* Work */}
        <section id="work" className="mt-28 sm:mt-36">
          <p className="border-b border-rule pb-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-dust">
            selected work — real, running, and mine
          </p>
          {projects.map((p) => (
            <article
              key={p.title}
              className="grid gap-8 border-b border-rule py-14 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-12"
            >
              <div>
                <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-dust">
                  {p.log}
                </p>
                <h2 className="mt-3 font-display text-[2.25rem] font-semibold uppercase leading-none tracking-[0.01em]">
                  {p.title}
                </h2>
                {p.demo ? (
                  <AwdjDemo />
                ) : (
                  <div className="readout mt-6 px-5 py-4 font-mono text-[0.8125rem] leading-relaxed">
                    {p.readout.map((line, i) => (
                      <p
                        key={line}
                        className={i === p.readout.length - 1 ? "cursor" : undefined}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div>
                {p.body.map((para) => (
                  <p key={para.slice(0, 24)} className="mt-5 first:mt-0">
                    {para}
                  </p>
                ))}
                <p className="mt-6 font-mono text-[0.8125rem] text-dust">
                  {p.stack}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Currently */}
        <section id="currently" className="mt-28 sm:mt-36">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-dust">
            currently
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[2.25rem] font-semibold uppercase leading-tight tracking-[0.01em] sm:text-[3rem]">
            Investing in defense technology at CET Sandbox.
          </h2>
          <p className="mt-6 max-w-xl text-dust">
            Scouting the builders rearming the West — from Tel Aviv, where the
            proving ground is the neighborhood.
          </p>
        </section>

        {/* Contact */}
        <footer className="mt-28 border-t border-rule py-14 sm:mt-36">
          <p className="max-w-xl">
            The repos are private — they hold my training data and my music —
            but I’ll gladly walk through any of the code, live.
          </p>
          <p className="mt-8 font-mono text-[0.8125rem]">
            <a
              className="inline-block py-3 -my-3 text-phosphor underline decoration-rule underline-offset-4 transition-colors hover:decoration-phosphor focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor"
              href="mailto:eroberts799@gmail.com"
            >
              eroberts799@gmail.com
            </a>
            <span className="mx-3 text-rule">/</span>
            <a
              className="inline-block py-3 -my-3 text-dust underline decoration-rule underline-offset-4 transition-colors hover:text-bone hover:decoration-phosphor focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor"
              href="https://github.com/eroberts7799"
            >
              github.com/eroberts7799
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
