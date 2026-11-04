import { site } from "../site";
import { FileIcon, GitHubIcon, MailIcon } from "./Icons";

export default function SocialLinks() {
  const linkClass =
    "tip group inline-flex flex-1 items-center gap-2 p-2 text-xl text-quaternary transition-colors hover:text-primary";
  return (
    <ul className="flex flex-row gap-2 px-4">
      <li className="flex">
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} -ml-1`}
          aria-label="GitHub"
          data-tip="GitHub"
        >
          <GitHubIcon className="select-none" />
        </a>
      </li>
      <li className="flex">
        <a href={`mailto:${site.email}`} className={linkClass} aria-label="Contact Ethan" data-tip="Contact Ethan">
          <MailIcon className="select-none" />
        </a>
      </li>
      <li className="flex">
        <a
          href={site.resume}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Resume"
          data-tip="Resume"
        >
          <FileIcon className="select-none" />
        </a>
      </li>
    </ul>
  );
}
