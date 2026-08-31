const projects = [
  {
    eyebrow: "Runs on my wrist",
    title: "AI Workout DJ",
    trace:
      "onTimerStart → t=0 backdated · HR 162 → drop scheduled 03:12 · deck B cued",
    body: [
      "Music apps react. This one anticipates: a deterministic choreography engine reads live heart rate, GPS, and the structure of a planned workout, and lands the drop at the moment the hill does.",
      "A Garmin Connect IQ field streams the run off the watch in real time; a TypeScript conductor is the source of truth, ported line-for-line to Swift for iOS with a parity suite replaying real sessions. Engine changes ship with a verdict from a critic that renders and judges actual audio — not vibes.",
    ],
    stack: "TypeScript · Swift · Monkey C (Garmin) · audio DSP · Vercel",
  },
  {
    eyebrow: "Texts me first",
    title: "Health Coach",
    trace: "06:05 → sleep 7.5h (91) · leg day · feels-like 27° · eat by 6:45",
    body: [
      "Every morning at 6:05 an agent reads my night — real sleep stages, resting HR, training load from my watch — checks my training plan and the Tel Aviv weather, and texts me exactly what to eat and when. I never open a dashboard.",
      "Garmin data flows into a local SQLite system of record; an always-on agent on my own server writes the briefings and answers ad-hoc questions grounded in the actual numbers. Meal logs sync between machines through git. Built in a weekend, coaching me daily since.",
    ],
    stack: "Python · SQLite · LLM agent · Telegram · self-hosted",
  },
  {
    eyebrow: "Built to understand",
    title: "LLM from scratch",
    trace: 'step 4800 · loss 2.41 → sample: "the cat sat on the mat and"',
    body: [
      "A GPT built from first principles — tokenizer, attention, training loop, all of it — then supervised-fine-tuned into a small chat model. No frameworks doing the thinking.",
      "Written as an explain-it-simply series: every mechanism gets a working implementation and a plain-language account of why it exists. The point wasn’t the model; it was earning the right to reason about the tools I use every day.",
    ],
    stack: "Python · PyTorch · tokenization → attention → SFT",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-20 sm:pt-28">
      {/* Hero */}
      <header>
        <p
          className="rise font-mono text-[0.8125rem] text-muted"
          style={{ animationDelay: "0ms" }}
        >
          Ethan Roberts — Tel Aviv
        </p>
        <h1
          className="rise mt-6 font-serif text-[2.75rem] leading-[1.08] tracking-[-0.01em] sm:text-[3.5rem]"
          style={{ animationDelay: "120ms" }}
        >
          I build the software
          <br />
          I want <em className="text-olive">to live with</em>.
        </h1>
        <p
          className="rise mt-8 text-muted"
          style={{ animationDelay: "260ms" }}
        >
          By day I invest in defense technology at CET Sandbox. The rest of the
          time I ship systems that run my actual life — on my wrist, my phone,
          and a server that texts me before I wake up. Everything below is
          real, running, and mine.
        </p>
      </header>

      {/* Projects */}
      <section className="mt-20">
        {projects.map((p, i) => (
          <article
            key={p.title}
            className="rise border-t border-hairline pt-10 pb-12"
            style={{ animationDelay: `${380 + i * 120}ms` }}
          >
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-olive">
              {p.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-[2rem] leading-tight">
              {p.title}
            </h2>
            <p className="trace mt-4 font-mono text-[0.8125rem] leading-relaxed text-ink/80">
              <span aria-hidden="true" className="mr-2 select-none text-olive">
                ❯
              </span>
              {p.trace.split(" · ").map((seg, j) => (
                <span key={seg}>
                  {j > 0 && <span className="text-muted"> · </span>}
                  <span className="whitespace-nowrap">{seg}</span>
                </span>
              ))}
            </p>
            {p.body.map((para) => (
              <p key={para.slice(0, 24)} className="mt-5">
                {para}
              </p>
            ))}
            <p className="mt-6 font-mono text-[0.8125rem] text-muted">
              {p.stack}
            </p>
          </article>
        ))}
      </section>

      {/* Contact */}
      <footer className="rise border-t border-hairline pt-10" style={{ animationDelay: "740ms" }}>
        <p>
          The repos are private — they hold my training data and my music — but
          I’ll gladly walk through any of the code, live.
        </p>
        <p className="mt-6">
          <a
            className="inline-block py-3 -my-3 underline decoration-hairline underline-offset-4 transition-colors hover:decoration-olive focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
            href="mailto:eroberts799@gmail.com"
          >
            eroberts799@gmail.com
          </a>
          <span className="mx-3 text-hairline">/</span>
          <a
            className="inline-block py-3 -my-3 underline decoration-hairline underline-offset-4 transition-colors hover:decoration-olive focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
            href="https://github.com/eroberts7799"
          >
            github.com/eroberts7799
          </a>
        </p>
      </footer>
    </main>
  );
}
