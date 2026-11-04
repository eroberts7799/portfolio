import type { Metadata } from "next";
import Avatar from "../components/Avatar";
import SocialLinks from "../components/SocialLinks";
import { site } from "../site";

export const metadata: Metadata = {
  title: "About",
};

const work = [
  {
    name: "CET Sandbox",
    role: "U.S. defense-industrial base partnerships",
    when: "Current",
    href: "https://cetsandbox.com",
  },
  {
    name: "Wisetack",
    role: "Embedded-financing partnerships",
    when: "Previously",
    href: "https://www.wisetack.com",
  },
];

export default function About() {
  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <h1 className="sr-only">About</h1>
        <Avatar />
        <p className="text-pretty text-2xl font-medium text-secondary">
          I work with American defense contractors to source battle-tested Israeli
          defense tech from Israeli startups. I do this at CET Sandbox, where I run U.S.
          defense-industrial base partnerships.
        </p>
        <p className="text-2xl font-medium text-secondary">
          I’m more technical than most BD people. I can build things and I understand
          how the products I’m selling actually work.
        </p>
        <p className="text-2xl font-medium text-secondary">
          Before this I was at Wisetack, a fintech. I launched and scaled 20+
          embedded-financing partnerships with vertical SaaS platforms through API
          integrations. In 2024 that came out to $1.5M+ in revenue and $30M+ in loans
          issued.
        </p>
        <p className="text-2xl font-medium text-secondary">
          I also write a weekly defense-tech newsletter for 600+ Israeli founders,
          investors, and ecosystem people. Average open rate is over 50%. I built AI
          agents that do the drafting and find the solicitations.
        </p>
        <p className="text-2xl font-medium text-secondary">
          Outside of work I train a lot and like long, hard days outdoors.
        </p>
      </div>

      <SocialLinks />

      <div className="flex flex-col gap-4 px-4">
        <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">Work</h2>
        <ul className="flex flex-col gap-8 sm:gap-1.5">
          {work.map((w) => (
            <li key={w.name} className="flex">
              <a
                href={w.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/list-item inline-flex flex-1 flex-col items-start gap-0.5 text-xl sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex items-center gap-2 sm:contents">
                  <span className="line-clamp-1 font-medium leading-[1.6] text-primary underline-offset-1 group-hover/list-item:underline">
                    {w.name}
                  </span>
                  <span className="leading-[1.6] text-quaternary">{w.role}</span>
                </div>
                <span className="font-mono text-[19px] text-quaternary opacity-80 sm:ml-auto">
                  {w.when}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">Contact</h2>
        <ul className="flex flex-col gap-4 sm:gap-1.5">
          <li className="flex">
            <a
              href={`mailto:${site.email}`}
              className="group/list-item inline-flex flex-1 items-center gap-2 text-xl"
            >
              <span className="font-medium leading-[1.6] text-primary underline-offset-1 group-hover/list-item:underline">
                {site.email}
              </span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
