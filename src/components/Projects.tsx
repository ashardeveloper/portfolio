"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import type { Project, SectionCopy } from "@/lib/schema";
import { ArrowRight, ExternalIcon, GitHubIcon } from "./Icons";
import { Reveal } from "./motion";
import { ProjectCover } from "./ProjectCover";
import { SectionHeading, Todo } from "./SectionHeading";

/** 3D tilt toward the cursor, with a glow that follows it. */
function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgb(139 92 246 / 0.22), transparent 60%)`;

  return (
    <motion.div
      className={`group relative ${className ?? ""}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        gx.set(px * 100);
        gy.set(py * 100);
        if (reduce) return;
        ry.set((px - 0.5) * 7);
        rx.set((0.5 - py) * 7);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />
    </motion.div>
  );
}

function Actions({ project }: { project: Project }) {
  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3.5 py-2 text-xs font-medium transition-colors hover:border-cyan/50 hover:bg-cyan/10";
  return (
    <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
      <Link
        href={`/projects/${project.slug}`}
        className="bg-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-bg"
      >
        Case study
        <ArrowRight width={14} height={14} />
      </Link>
      {project.live && (
        <a href={project.live} target="_blank" rel="noreferrer" className={btn}>
          <ExternalIcon width={14} height={14} />
          Live demo
        </a>
      )}
      {project.github ? (
        <a href={project.github} target="_blank" rel="noreferrer" className={btn}>
          <GitHubIcon width={14} height={14} />
          {project.live ? "GitHub" : "View source"}
        </a>
      ) : null}
      {project.todos.length > 0 && <Todo>{project.todos.length} to add</Todo>}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
      {items.map((s) => (
        <li key={s} className="chip">
          {s}
        </li>
      ))}
    </ul>
  );
}

function Flagship({ project }: { project: Project }) {
  return (
    <Tilt>
      <article className="glass grid overflow-hidden rounded-3xl transition-colors group-hover:border-violet/50 lg:grid-cols-[1.25fr_1fr]">
        <ProjectCover
          project={project}
          priority={false}
          sizes="(min-width: 1024px) 660px, 100vw"
          className="aspect-[4/3] lg:aspect-auto lg:min-h-[26rem]"
        />
        <div className="flex flex-col justify-center p-6 sm:p-9">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
            Flagship{project.year && ` · ${project.year}`}
          </p>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h3>
          <p className="mt-1 text-muted">{project.subtitle}</p>
          <p className="mt-4 text-lg leading-relaxed text-ink/90">{project.oneLiner}</p>
          <Chips items={project.cardStack} />
          <Actions project={project} />
        </div>
      </article>
    </Tilt>
  );
}

function Card({ project }: { project: Project }) {
  const highlights = project.apps.filter((a) => a.highlight);
  return (
    <Tilt className="h-full">
      <article className="glass flex h-full flex-col overflow-hidden rounded-3xl transition-colors group-hover:border-violet/50">
        <div className="relative">
          <ProjectCover project={project} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" />
          {project.flagship && (
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-bg/80 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cyan backdrop-blur">
              Flagship
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-cyan">{project.subtitle}</p>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{project.title}</h3>
          <p className="mt-2 leading-relaxed text-muted">{project.oneLiner}</p>
          {highlights.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-ink/85">
              {highlights.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span aria-hidden className="bg-accent mt-2 size-1 shrink-0 rounded-full" />
                  {a.name}
                </li>
              ))}
            </ul>
          )}
          <Chips items={project.cardStack} />
          <div className="mt-auto">
            <Actions project={project} />
          </div>
        </div>
      </article>
    </Tilt>
  );
}

/** Responsive grid of project cards, shared by the home section and the All projects page. */
export function ProjectGrid({ projects, className = "" }: { projects: Project[]; className?: string }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {projects.map((p, i) => (
        <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
          <Card project={p} />
        </Reveal>
      ))}
    </div>
  );
}

export function Projects({
  projects,
  section,
  limit,
}: {
  projects: Project[];
  section: SectionCopy;
  /** How many projects to show here, counting the flagship. The rest live on /projects. */
  limit: number;
}) {
  if (projects.length === 0) return null;
  const flagship = projects.find((p) => p.flagship) ?? projects[0];
  const rest = projects.filter((p) => p !== flagship).slice(0, Math.max(0, limit - 1));
  const hidden = projects.length - 1 - rest.length;

  return (
    <section id="projects" className="section">
      <SectionHeading
        index="04"
        eyebrow={section.eyebrow}
        title={section.title}
        lead={section.lead}
      />

      <Reveal>
        <Flagship project={flagship} />
      </Reveal>

      {rest.length > 0 && <ProjectGrid projects={rest} className="mt-6" />}

      {hidden > 0 && (
        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
            Showing {rest.length + 1} of {projects.length} projects
          </p>
          <Link
            href="/projects"
            className="group/all inline-flex items-center gap-2.5 rounded-full border border-line bg-white/5 px-7 py-3.5 text-sm font-semibold transition-colors hover:border-cyan/60 hover:bg-cyan/10"
          >
            View all projects
            <ArrowRight className="transition-transform group-hover/all:translate-x-1" />
          </Link>
        </Reveal>
      )}
    </section>
  );
}
