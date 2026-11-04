import Link from "next/link";
import { ExternalIcon } from "./Icons";

// One row in a Writing / Projects list: title, optional external arrow, and a
// muted description that sits inline on desktop and stacks on mobile.
export default function ListItem({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description?: string;
  external?: boolean;
}) {
  const className = description
    ? "group/list-item inline-flex flex-1 flex-col items-start gap-0 text-xl sm:flex-row sm:items-center sm:gap-2"
    : "group/list-item inline-flex flex-1 items-center gap-2 text-xl";

  const inner = (
    <>
      <div className="flex items-center gap-2">
        <span
          className={`font-medium leading-[1.6] text-primary underline-offset-1 group-hover/list-item:underline ${
            description ? "line-clamp-1" : "line-clamp-none"
          }`}
        >
          {title}
          {external && (
            <ExternalIcon className="ml-1 inline-block -translate-y-px align-middle text-primary" />
          )}
        </span>
      </div>
      {description && (
        <span className="flex-1 leading-[1.6] text-quaternary">{description}</span>
      )}
    </>
  );

  return (
    <li className="flex">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={className}>
          {inner}
        </Link>
      )}
    </li>
  );
}
