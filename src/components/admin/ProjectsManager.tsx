"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProject,
  deleteProject,
  moveProject,
  setProjectPublished,
  type ActionResult,
} from "@/app/admin/actions";
import type { Project } from "@/lib/schema";
import { ConfirmDelete, DownIcon, PlusIcon, UpIcon } from "./fields";

const iconBtn =
  "grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-white/10 hover:text-ink disabled:pointer-events-none disabled:opacity-30";

export function ProjectsManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (action: () => Promise<ActionResult<unknown>>, after?: (data: unknown) => void) =>
    start(async () => {
      setError("");
      const result = await action();
      if (!result.ok) return setError(result.error);
      after?.(result.data);
      router.refresh();
    });

  const flagshipId = (projects.find((p) => p.published && p.flagship) ?? projects.find((p) => p.published))?.id;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Add, reorder, hide or delete projects. The order here is the order on the site.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(createProject, (data) => router.push(`/admin/projects/${(data as { id: string }).id}`))}
          className="bg-accent inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-bg disabled:opacity-50"
        >
          <PlusIcon />
          Add project
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {projects.length === 0 ? (
        <p className="glass rounded-2xl px-6 py-12 text-center text-muted">No projects yet. Add your first one.</p>
      ) : (
        <ul className={`space-y-3 ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
          {projects.map((p, i) => {
            const cover = p.screenshots[0];
            return (
              <li key={p.id} className="glass flex flex-wrap items-center gap-4 rounded-2xl p-3 sm:flex-nowrap">
                <div
                  className="size-16 shrink-0 overflow-hidden rounded-xl bg-raised"
                  style={cover ? undefined : { backgroundImage: `linear-gradient(135deg, ${p.accent.from}, ${p.accent.to})` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover.src} alt="" loading="lazy" className="size-full object-cover object-top" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/projects/${p.id}`} className="truncate font-display text-lg font-semibold hover:text-cyan">
                      {p.title}
                    </Link>
                    {p.id === flagshipId && <Badge tone="violet">Flagship</Badge>}
                    {!p.published && <Badge tone="muted">Hidden</Badge>}
                    {p.todos.length > 0 && <Badge tone="amber">{p.todos.length} to-do</Badge>}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted">{p.subtitle || p.oneLiner || "No subtitle"}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-faint">
                    /projects/{p.slug} · {p.screenshots.length} screenshot{p.screenshots.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" className={iconBtn} disabled={pending || i === 0} aria-label={`Move ${p.title} up`} onClick={() => run(() => moveProject(p.id, -1))}>
                    <UpIcon />
                  </button>
                  <button type="button" className={iconBtn} disabled={pending || i === projects.length - 1} aria-label={`Move ${p.title} down`} onClick={() => run(() => moveProject(p.id, 1))}>
                    <DownIcon />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setProjectPublished(p.id, !p.published))}
                    className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:bg-white/10 hover:text-ink"
                  >
                    {p.published ? "Hide" : "Publish"}
                  </button>
                  <Link href={`/admin/projects/${p.id}`} className="rounded-md border border-line bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10">
                    Edit
                  </Link>
                  <ConfirmDelete label={p.title} onConfirm={() => run(() => deleteProject(p.id))} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "violet" | "muted" | "amber"; children: React.ReactNode }) {
  const tones = {
    violet: "border-violet/40 bg-violet/15 text-violet-200",
    muted: "border-line bg-white/5 text-muted",
    amber: "border-todo/40 bg-todo/10 text-todo",
  };
  return <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
}
