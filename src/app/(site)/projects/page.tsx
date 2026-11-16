import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { ProjectGrid } from "@/components/Projects";
import { getContent, visibleProjects } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { profile, sections } = await getContent();
  return {
    title: "Projects",
    description: sections.projects.lead || `Projects built by ${profile.name}.`,
    alternates: { canonical: "/projects" },
  };
}

export default async function AllProjectsPage() {
  const content = await getContent();
  const { sections } = content;
  const all = visibleProjects(content);
  // Flagship first, then the order set in the admin.
  const projects = [...all.filter((p) => p.flagship), ...all.filter((p) => !p.flagship)];

  return (
    <div className="mx-auto w-full max-w-[76rem] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft width={15} height={15} />
          Back to home
        </Link>

        <header className="mb-12 mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 md:mb-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">{sections.projects.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">All projects</h1>
            {sections.projects.lead && (
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{sections.projects.lead}</p>
            )}
          </div>
          {projects.length > 0 && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
              <span className="text-gradient font-display text-3xl font-bold normal-case tracking-tight">
                {projects.length}
              </span>{" "}
              {projects.length === 1 ? "project" : "projects"}
            </p>
          )}
        </header>
      </Reveal>

      {projects.length === 0 ? (
        <p className="glass rounded-3xl px-6 py-12 text-center text-muted">No projects have been published yet.</p>
      ) : (
        <ProjectGrid projects={projects} />
      )}

      {sections.contact.visible && (
        <Reveal className="mt-16 md:mt-20">
          <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-3xl p-6 sm:p-9">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Have something similar in mind?</h2>
              <p className="mt-1.5 text-muted">Tell me about it and I will get back to you by email.</p>
            </div>
            <Link
              href="/#contact"
              className="bg-accent group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-bg"
            >
              Get in touch
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      )}
    </div>
  );
}
