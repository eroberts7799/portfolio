import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AwdjDemo from "../components/AwdjDemo";
import CoachDemo from "../components/CoachDemo";
import { ExternalIcon } from "../components/Icons";
import LlmDemo from "../components/LlmDemo";
import { projects } from "../site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <h1 className="text-3xl font-bold leading-[1.2] -tracking-[0.64px] md:text-4xl lg:text-[2.5rem]">
          {project.title}
        </h1>
        <p className="text-pretty text-2xl font-medium text-secondary">{project.description}</p>
      </div>

      <div className="px-4">
        {project.demo === "awdj" ? (
          <AwdjDemo />
        ) : project.demo === "coach" ? (
          <CoachDemo />
        ) : (
          <LlmDemo />
        )}
      </div>

      <div className="flex flex-col gap-4 px-4">
        {project.body.map((para) => (
          <p key={para.slice(0, 24)} className="text-xl font-medium text-secondary">
            {para}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-4">
        <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">Stack</h2>
        <ul className="flex flex-col gap-4 sm:gap-1.5">
          {project.stack.map((s) => (
            <li key={s} className="flex text-xl leading-[1.6] text-primary">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <h2 className="select-none leading-[1.6] text-quaternary dark:text-tertiary">Links</h2>
        <ul className="flex flex-col gap-4 sm:gap-1.5">
          {project.links.map((l) => (
            <li key={l.href} className="flex">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/list-item inline-flex flex-1 items-center gap-2 text-xl"
              >
                <span className="font-medium leading-[1.6] text-primary underline-offset-1 group-hover/list-item:underline">
                  {l.label}
                </span>
                <span className="shrink-0 leading-[1.6] text-quaternary">
                  <ExternalIcon className="text-primary" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
