import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { ArrowLeft, ArrowRight, CheckIcon, ExternalIcon, GitHubIcon } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { ProjectCover } from "@/components/ProjectCover";
import { getContent, visibleProjects } from "@/lib/content";
import { isUpload } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = visibleProjects(await getContent()).find((p) => p.slug === slug);
  if (!project) return {};
  const cover = project.screenshots[0];
  return {
    title: `${project.title} — ${project.subtitle}`,
    description: project.oneLiner,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — ${project.subtitle}`,
      description: project.oneLiner,
      url: `/projects/${project.slug}`,
      ...(cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height }] } : {}),
    },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr] md:gap-10">
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">{title}</h2>
        <div>{children}</div>
      </section>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = visibleProjects(await getContent());
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const cover = project.screenshots[0];
  const btn =
    "inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:border-cyan/50 hover:bg-cyan/10";

  return (
    <article className="mx-auto w-full max-w-[68rem] px-5 pb-20 pt-28 md:px-8 md:pt-32">
      <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft width={15} height={15} />
        All projects
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
          {project.subtitle}
          {project.year && <span className="text-faint"> · {project.year}</span>}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">{project.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">{project.oneLiner}</p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="bg-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-bg"
            >
              <ExternalIcon width={15} height={15} />
              Live demo
            </a>
          )}
          {project.github ? (
            <a href={project.github} target="_blank" rel="noreferrer" className={btn}>
              <GitHubIcon width={15} height={15} />
              {project.live ? "GitHub" : "View source"}
            </a>
          ) : null}
        </div>
      </header>

      {/* Hero visual */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[0.68rem] text-faint">
            {project.live ? project.live.replace(/^https?:\/\//, "").replace(/\/$/, "") : project.slug}
          </span>
        </div>
        {cover ? (
          <Image
            src={cover.src}
            unoptimized={isUpload(cover.src)}
            alt={`${project.title} — ${cover.caption}`}
            width={cover.width}
            height={cover.height}
            priority
            sizes="(min-width: 1100px) 1024px, 100vw"
            className="mx-auto h-auto max-h-[46rem] w-auto max-w-full"
          />
        ) : (
          <ProjectCover project={project} sizes="100vw" className="aspect-[16/7]" />
        )}
      </div>

      {project.todos.length > 0 && (
        <aside className="mt-8 rounded-2xl border border-dashed border-todo/40 bg-todo/5 p-5" aria-label="Missing details">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-todo">TODO — details still to add</p>
          <ul className="mt-3 space-y-1.5 text-sm text-todo/90">
            {project.todos.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="mt-10">
        {project.problem && (
          <Block title="Problem">
            <p className="text-lg leading-relaxed text-muted">{project.problem}</p>
          </Block>
        )}

        {project.solution && (
          <Block title="Solution">
            <p className="text-lg leading-relaxed text-muted">{project.solution}</p>
          </Block>
        )}

        {project.apps.length > 0 && (
          <Block title="The apps">
            <ol className="grid gap-4 sm:grid-cols-2">
              {project.apps.map((a, i) => (
                <li key={a.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</p>
                    {a.metric && (
                      <p className="text-gradient font-display text-2xl font-bold leading-none">{a.metric}</p>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{a.name}</h3>
                  {a.detail && <p className="mt-2 text-sm leading-relaxed text-muted">{a.detail}</p>}
                </li>
              ))}
            </ol>
          </Block>
        )}

        {project.engineering.length > 0 && (
          <Block title="Engineering focus">
            <ul className="space-y-3">
              {project.engineering.map((e) => (
                <li key={e} className="flex gap-3 leading-relaxed text-muted">
                  <span aria-hidden className="bg-accent mt-[0.6rem] size-1.5 shrink-0 rounded-full" />
                  {e}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {project.features.length > 0 && (
          <Block title="Features">
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-muted">
                  <CheckIcon width={16} height={16} className="mt-1 shrink-0 text-cyan" />
                  {f}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {project.stack.length > 0 && (
        <Block title="Tech stack">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="chip px-3.5 py-1.5 text-[0.8rem]">
                {s}
              </li>
            ))}
          </ul>
        </Block>
        )}

        {project.screenshots.length > 0 && (
          <Block title="Screenshots">
            <Gallery shots={project.screenshots} title={project.title} />
          </Block>
        )}

        {project.note && (
          <Block title="Scope">
            <p className="leading-relaxed text-muted">{project.note}</p>
          </Block>
        )}
      </div>

      {projects.length > 1 && (
      <nav aria-label="More projects" className="mt-6 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
        <Link href={`/projects/${prev.slug}`} className="glass group rounded-2xl p-5 transition-colors hover:border-violet/50">
          <span className="flex items-center gap-2 font-mono text-xs text-faint">
            <ArrowLeft width={14} height={14} className="transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="mt-2 block font-display text-xl font-semibold">{prev.title}</span>
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          className="glass group rounded-2xl p-5 text-right transition-colors hover:border-violet/50"
        >
          <span className="flex items-center justify-end gap-2 font-mono text-xs text-faint">
            Next
            <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-1" />
          </span>
          <span className="mt-2 block font-display text-xl font-semibold">{next.title}</span>
        </Link>
      </nav>
      )}
    </article>
  );
}
