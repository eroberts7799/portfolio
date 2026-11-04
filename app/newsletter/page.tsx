import type { Metadata } from "next";
import editions from "../../data/newsletter.json";
import { ExternalIcon } from "../components/Icons";

export const metadata: Metadata = {
  title: "Defense Tech Newsletter",
  description: "Every edition of the CET Sandbox weekly defense-tech newsletter.",
};

type Edition = { id: string; date: string; title: string; url: string };

// Group by year, newest first; editions are already sorted newest → oldest.
function byYear(list: Edition[]) {
  const groups = new Map<string, Edition[]>();
  for (const e of list) {
    const y = e.date.slice(0, 4);
    groups.set(y, [...(groups.get(y) ?? []), e]);
  }
  return [...groups.entries()];
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default function Newsletter() {
  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <h1 className="text-3xl font-bold leading-[1.2] -tracking-[0.64px] md:text-4xl lg:text-[2.5rem]">
          Defense Tech Newsletter
        </h1>
        <p className="text-pretty text-2xl font-medium text-secondary">
          The CET Sandbox weekly brief on U.S. defense for Israeli founders.
        </p>
      </div>

      {byYear(editions as Edition[]).map(([year, list]) => (
        <div key={year} className="flex flex-col gap-4 px-4">
          <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">{year}</h2>
          <ul className="flex flex-col gap-4 sm:gap-1.5">
            {list.map((e) => (
              <li key={e.id} className="flex">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/list-item inline-flex flex-1 flex-col items-start gap-0 text-xl sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="font-medium leading-[1.6] text-primary underline-offset-1 group-hover/list-item:underline">
                    {e.title}
                    <ExternalIcon className="ml-1 inline-block -translate-y-px align-middle text-primary" />
                  </span>
                  <span className="shrink-0 font-mono text-[19px] leading-[1.6] text-quaternary opacity-80 sm:ml-auto">
                    {fmtDate(e.date)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
