"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearFailures,
  clientIp,
  createSession,
  destroySession,
  isAdmin,
  lockedFor,
  recordFailure,
} from "@/lib/auth";
import { readContentFresh, writeContent } from "@/lib/content";
import { dbConfigured } from "@/lib/db";
import { contentSchema, formatIssues, projectSchema, type Content, type Project, type SliceKey } from "@/lib/schema";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (error: string): ActionResult<never> => ({ ok: false, error });

function describeWriteError(e: unknown): string {
  const code = (e as NodeJS.ErrnoException)?.code;
  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return "This server's files are read-only, so changes cannot be saved here. Edit on your own computer and redeploy.";
  }
  if (dbConfigured()) {
    console.error("[admin] database write failed:", e instanceof Error ? e.message : e);
    return "Could not reach the database, so nothing was saved. Check the database settings and try again.";
  }
  return "Could not save. Please try again.";
}

/** Every mutation goes through here: auth check, validate, write, refresh the public pages. */
async function mutate(change: (content: Content) => Content | string): Promise<ActionResult> {
  if (!(await isAdmin())) return fail("Your session has expired. Please sign in again.");

  let current: Content;
  try {
    current = await readContentFresh();
  } catch (e) {
    return fail(describeWriteError(e));
  }
  const next = change(current);
  if (typeof next === "string") return fail(next);

  const parsed = contentSchema.safeParse(next);
  if (!parsed.success) return fail(formatIssues(parsed.error));

  try {
    await writeContent(parsed.data);
  } catch (e) {
    return fail(describeWriteError(e));
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---- Auth ---- */

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const ip = await clientIp();
  const wait = lockedFor(ip);
  if (wait) return { error: `Too many attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` };

  if (!checkPassword(String(form.get("password") ?? ""))) {
    recordFailure(ip);
    return { error: "Incorrect password." };
  }
  clearFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---- Sections ---- */

export async function saveSlice(key: SliceKey, value: unknown): Promise<ActionResult> {
  if (!(key in contentSchema.shape)) return fail("Unknown section.");
  return mutate((content) => ({ ...content, [key]: value }) as Content);
}

/* ---- Projects ---- */

export async function createProject(): Promise<ActionResult<{ id: string }>> {
  const id = randomUUID().slice(0, 8);
  const result = await mutate((content) => {
    const project: Project = {
      id,
      slug: `new-project-${id.slice(0, 4)}`,
      published: false,
      flagship: false,
      title: "New project",
      subtitle: "",
      oneLiner: "",
      year: String(new Date().getFullYear()),
      github: "",
      live: "",
      accent: { from: "#8b5cf6", to: "#22d3ee" },
      problem: "",
      solution: "",
      engineering: [],
      features: [],
      apps: [],
      stack: [],
      cardStack: [],
      screenshots: [],
      note: "",
      todos: [],
    };
    return { ...content, projects: [...content.projects, project] };
  });
  return result.ok ? { ok: true, data: { id } } : result;
}

export async function saveProject(id: string, value: unknown): Promise<ActionResult> {
  const parsed = projectSchema.safeParse(value);
  if (!parsed.success) return fail(formatIssues(parsed.error));
  const project = { ...parsed.data, id };

  return mutate((content) => {
    if (!content.projects.some((p) => p.id === id)) return "This project no longer exists.";
    if (content.projects.some((p) => p.id !== id && p.slug === project.slug)) {
      return `Another project already uses the address "${project.slug}".`;
    }
    return {
      ...content,
      projects: content.projects.map((p) =>
        p.id === id
          ? project
          : // Only one project can be the flagship.
            project.flagship
            ? { ...p, flagship: false }
            : p,
      ),
    };
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return mutate((content) => ({ ...content, projects: content.projects.filter((p) => p.id !== id) }));
}

export async function moveProject(id: string, direction: -1 | 1): Promise<ActionResult> {
  return mutate((content) => {
    const list = [...content.projects];
    const from = list.findIndex((p) => p.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.length) return content;
    [list[from], list[to]] = [list[to], list[from]];
    return { ...content, projects: list };
  });
}

export async function setProjectPublished(id: string, published: boolean): Promise<ActionResult> {
  return mutate((content) => ({
    ...content,
    projects: content.projects.map((p) => (p.id === id ? { ...p, published } : p)),
  }));
}
