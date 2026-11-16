"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deleteProject, saveProject, saveSlice, type ActionResult } from "@/app/admin/actions";
import type { Project, SliceKey } from "@/lib/schema";
import { ConfirmDelete, Fields, type FieldDef, type Obj } from "./fields";
import {
  aboutFields,
  certificationFields,
  educationFields,
  experienceFields,
  heroFields,
  projectFields,
  sectionsFields,
  skillsFields,
} from "./schemas";

type Status = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

/** Holds a draft, tracks unsaved changes, and saves through a server action. */
function EditorShell({
  title,
  description,
  fields,
  initial,
  onSave,
  headerActions,
  backHref,
}: {
  title: string;
  description?: string;
  fields: FieldDef[];
  initial: Obj;
  onSave: (value: Obj) => Promise<ActionResult>;
  headerActions?: ReactNode;
  backHref?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Obj>(initial);
  const [saved, setSaved] = useState<Obj>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [value, saved]);
  const latest = useRef({ value, dirty, saving });
  latest.current = { value, dirty, saving };

  const save = useCallback(async () => {
    const { value, dirty, saving } = latest.current;
    if (!dirty || saving) return;
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const result = await onSave(value);
      if (result.ok) {
        setSaved(value);
        setStatus({ kind: "saved" });
        router.refresh();
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    } catch {
      setStatus({ kind: "error", message: "Could not reach the server. Check that it is running and try again." });
    } finally {
      setSaving(false);
    }
  }, [onSave, router]);

  // Ctrl/Cmd+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (latest.current.dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save]);

  return (
    <div className="pb-28">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          {backHref && (
            <Link href={backHref} className="mb-2 inline-block text-sm text-muted hover:text-ink">
              ← Back
            </Link>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </header>

      <form
        className="glass rounded-2xl p-5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <Fields
          fields={fields}
          value={value}
          onChange={(next) => {
            setValue(next);
            if (status.kind !== "idle") setStatus({ kind: "idle" });
          }}
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <p role="status" aria-live="polite" className="min-w-0 flex-1 text-sm">
            {status.kind === "error" ? (
              <span className="text-red-300">{status.message}</span>
            ) : dirty ? (
              <span className="text-todo">Unsaved changes</span>
            ) : status.kind === "saved" ? (
              <span className="text-emerald-300">Saved — the site is updated.</span>
            ) : (
              <span className="text-faint">No changes</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => {
                setValue(saved);
                setStatus({ kind: "idle" });
              }}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => void save()}
              className="bg-accent rounded-full px-5 py-2 text-sm font-semibold text-bg disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Section editors ---- */

const views = {
  hero: { slice: "profile", fields: heroFields, title: "Hero and profile", description: "Your name, role, photo, availability and contact links." },
  about: { slice: "profile", fields: aboutFields, title: "About", description: "Your bio, stat counters, what you are learning, and languages." },
  skills: { slice: "skills", fields: skillsFields, title: "Skills", description: "Skill groups and the labels on the 3D skills cloud." },
  experience: { slice: "experience", fields: experienceFields, title: "Experience", description: "Your professional roles." },
  education: { slice: "education", fields: educationFields, title: "Education", description: "Degrees shown below your experience." },
  certifications: { slice: "certifications", fields: certificationFields, title: "Certifications", description: "Certifications and achievements shown beside your education." },
  sections: { slice: "sections", fields: sectionsFields, title: "Section headings", description: "Show or hide each section and edit its heading." },
} satisfies Record<string, { slice: SliceKey; fields: FieldDef[]; title: string; description: string }>;

export type EditorView = keyof typeof views;

export function SliceEditor({ view, initial }: { view: EditorView; initial: unknown }) {
  const { slice, fields, title, description } = views[view];
  // List-only sections are wrapped so the form always edits an object.
  const isList = Array.isArray(initial);
  const wrapped = (isList ? { items: initial } : initial) as Obj;

  const onSave = useCallback(
    (value: Obj) => saveSlice(slice, isList ? value.items : value),
    [slice, isList],
  );

  return <EditorShell title={title} description={description} fields={fields} initial={wrapped} onSave={onSave} />;
}

export function ProjectEditor({ project }: { project: Project }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const fields = useMemo(() => projectFields(`projects-${project.id}`), [project.id]);
  const onSave = useCallback((value: Obj) => saveProject(project.id, value), [project.id]);

  const remove = async () => {
    const result = await deleteProject(project.id);
    if (result.ok) {
      router.push("/admin/projects");
      router.refresh();
    } else setError(result.error);
  };

  return (
    <EditorShell
      title={project.title}
      description="Everything shown on this project's card and case-study page."
      fields={fields}
      initial={project as unknown as Obj}
      onSave={onSave}
      backHref="/admin/projects"
      headerActions={
        <>
          {error && <span className="text-xs text-red-300">{error}</span>}
          {project.published && (
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              View page ↗
            </a>
          )}
          <ConfirmDelete label="this project" onConfirm={remove} />
        </>
      }
    />
  );
}
