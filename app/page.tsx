import Link from "next/link";
import Avatar from "./components/Avatar";
import { ChevronIcon } from "./components/Icons";
import ListItem from "./components/ListItem";
import SocialLinks from "./components/SocialLinks";
import editions from "../data/newsletter.json";
import { projects, site } from "./site";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <Avatar />
        <h1 id="home-title" className="text-2xl font-semibold">
          {site.name}
        </h1>
        <p className="text-pretty text-2xl font-semibold text-secondary">{site.bio}</p>
      </div>

      <SocialLinks />

      <div className="flex flex-col gap-4 px-4">
        <Link className="group flex items-center" href="/about">
          <h2 className="select-none leading-[1.6] text-quaternary transition-colors group-hover:text-primary dark:text-tertiary">
            About
          </h2>
          <ChevronIcon className="text-quaternary transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <Link className="group flex items-center" href="/newsletter">
          <h2 className="select-none leading-[1.6] text-quaternary transition-colors group-hover:text-primary dark:text-tertiary">
            Defense Tech Newsletter
          </h2>
          <ChevronIcon className="text-quaternary transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
        <ul className="flex flex-col gap-4 sm:gap-1.5">
          {editions.slice(0, 5).map((e) => (
            <ListItem key={e.id} href={e.url} title={e.title} external />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">Projects</h2>
        <ul className="flex flex-col gap-4 sm:gap-1.5">
          {projects.map((p) => (
            <ListItem
              key={p.slug}
              href={`/${p.slug}`}
              title={p.title}
              description={p.description}
            />
          ))}
        </ul>
      </div>
    </>
  );
}
