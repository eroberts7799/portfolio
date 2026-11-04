"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { pageTitles, projects, site } from "../site";
import { CloseIcon, GitHubIcon, MailIcon, MenuIcon } from "./Icons";

// Sticky 56px bar with the menu toggle; on subpages it also shows the
// "Ethan Roberts / Page" breadcrumb. The menu is a full-screen overlay.
export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const title = pageTitles[pathname];

  // Close the menu when navigation changes the route.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const itemClass = (active: boolean) =>
    `py-2 text-xl font-semibold transition-colors ${
      active ? "text-primary" : "text-tertiary hover:text-primary"
    }`;

  return (
    <>
      {open && (
        <div className="menu-in fixed inset-0 top-11 z-20 flex origin-top flex-col bg-main">
          <nav className="flex-1 overflow-y-auto p-6" aria-label="Site">
            <div className="flex flex-col gap-1">
              <Link href="/">
                <div className={itemClass(pathname === "/")}>Home</div>
              </Link>
              <Link href="/about">
                <div className={itemClass(pathname === "/about")}>About</div>
              </Link>
              <Link href="/newsletter">
                <div className={itemClass(pathname === "/newsletter")}>Defense Tech Newsletter</div>
              </Link>
              <a href={site.resume} target="_blank" rel="noopener noreferrer">
                <div className={itemClass(false)}>Resume</div>
              </a>
            </div>
            <div className="mt-8">
              <span className="text-sm font-medium text-quaternary">Projects</span>
              <div className="mt-3 flex flex-col gap-1">
                {projects.map((p) => (
                  <Link key={p.slug} href={`/${p.slug}`}>
                    <div className={itemClass(pathname === `/${p.slug}`)}>{p.title}</div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-row items-center gap-4">
              <a
                className="tip -ml-2 p-2 text-quaternary transition-colors hover:text-primary"
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                data-tip="GitHub"
              >
                <GitHubIcon size={24} />
              </a>
              <a
                className="tip p-2 text-quaternary transition-colors hover:text-primary"
                href={`mailto:${site.email}`}
                aria-label="Contact Ethan"
                data-tip="Contact Ethan"
              >
                <MailIcon size={24} />
              </a>
            </div>
          </nav>
        </div>
      )}

      <div className="sticky top-0 z-20 flex h-14 items-center gap-1 self-start bg-main px-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={`inline-flex h-9 w-9 flex-none cursor-pointer select-none items-center justify-center rounded-full p-0 text-primary transition-colors hover:bg-black/[0.08] focus-visible:outline-none dark:hover:bg-white/[0.12] ${
            open ? "bg-black/[0.08] dark:bg-white/[0.12]" : ""
          }`}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        {title && !open && (
          <>
            <Link
              href="/"
              className="rounded-md p-2 text-base font-medium text-primary transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            >
              {site.name}
            </Link>
            <div className="text-base font-medium text-quaternary" aria-hidden="true">
              /
            </div>
            <Link
              href={pathname}
              className="rounded-md p-2 text-base font-medium text-primary transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            >
              {title}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
