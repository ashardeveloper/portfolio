import { z } from "zod";

/**
 * Single source of truth for the shape of the site's content.
 * Used to validate data/content.json on read and every admin save on write.
 */

const text = (max = 300) => z.string().trim().max(max, `Keep this under ${max} characters`);
const required = (max = 300) => text(max).min(1, "Required");
const id = z.string().min(1).max(64);
const list = (maxItems = 80, maxLen = 400) => z.array(required(maxLen)).max(maxItems);

/** Empty, a site-relative path, or an http(s) URL. Blocks javascript: and data: URLs. */
const link = z
  .string()
  .trim()
  .max(600)
  .refine((v) => v === "" || /^(https?:\/\/|\/)/i.test(v), "Must start with https://, http:// or /");

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour, e.g. #8b5cf6");

export const profileSchema = z.object({
  name: required(80),
  initials: required(4),
  role: required(120),
  rotatingRoles: list(8, 60).min(1, "Add at least one role"),
  tagline: text(200),
  focus: text(200),
  location: text(80),
  locationFull: text(120),
  photo: link,
  photoBadge: text(60),
  availability: z.object({
    enabled: z.boolean(),
    badge: text(40),
    short: text(80),
    long: text(400),
  }),
  bio: list(8, 600),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  github: link,
  linkedin: link,
  cv: link,
  languages: z
    .array(z.object({ id, name: required(40), level: text(20), note: text(60) }))
    .max(12),
  stats: z
    .array(
      z.object({
        id,
        value: z.number().int().min(0).max(1_000_000),
        suffix: text(6),
        label: required(60),
      }),
    )
    .max(8),
  learning: list(20, 80),
});

const sectionSchema = z.object({
  visible: z.boolean(),
  eyebrow: required(40),
  title: required(120),
  lead: text(400),
});

/** The projects section also controls how many projects the home page shows before "View all". */
const projectsSectionSchema = sectionSchema.extend({
  homeLimit: z
    .number({ error: "Projects on the home page must be a number." })
    .int()
    .min(1, "Show at least 1 project on the home page.")
    .max(30, "Show at most 30 projects on the home page.")
    .default(4),
});

export const sectionsSchema = z.object({
  about: sectionSchema,
  skills: sectionSchema,
  experience: sectionSchema,
  projects: projectsSectionSchema,
  contact: sectionSchema,
});

export const skillsSchema = z.object({
  groups: z.array(z.object({ id, title: required(60), items: list(60, 80) })).max(20),
  cloud: list(40, 30),
});

export const roleSchema = z.object({
  id,
  title: required(120),
  company: required(160),
  period: required(60),
  summary: text(600),
  bullets: list(12, 400),
  stack: list(30, 60),
  metrics: z.array(z.object({ id, value: required(20), label: required(30) })).max(4),
});

export const educationSchema = z.object({
  id,
  school: required(160),
  degree: required(160),
  period: required(60),
});

export const certificationSchema = z.object({
  id,
  title: required(200),
  issuer: text(200),
  date: text(40),
});

export const shotSchema = z.object({
  id,
  src: link.refine((v) => v !== "", "Missing image"),
  width: z.number().int().min(1).max(20000),
  height: z.number().int().min(1).max(20000),
  caption: text(120),
});

export const projectSchema = z.object({
  id,
  slug: z
    .string()
    .trim()
    .min(1, "Required")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  published: z.boolean(),
  flagship: z.boolean(),
  title: required(100),
  subtitle: text(100),
  oneLiner: text(300),
  year: text(10),
  github: link,
  live: link,
  accent: z.object({ from: hex, to: hex }),
  problem: text(1500),
  solution: text(2000),
  engineering: list(20, 400),
  features: list(30, 200),
  apps: z
    .array(
      z.object({
        id,
        name: required(120),
        detail: text(400),
        metric: text(20),
        highlight: z.boolean(),
      }),
    )
    .max(20),
  stack: list(40, 60),
  cardStack: list(8, 30),
  screenshots: z.array(shotSchema).max(30),
  note: text(600),
  todos: list(20, 200),
});

export const contentSchema = z.object({
  profile: profileSchema,
  sections: sectionsSchema,
  skills: skillsSchema,
  experience: z.array(roleSchema).max(30),
  education: z.array(educationSchema).max(20),
  certifications: z.array(certificationSchema).max(40),
  projects: z
    .array(projectSchema)
    .max(60)
    .refine((ps) => new Set(ps.map((p) => p.slug)).size === ps.length, "Two projects share the same slug"),
});

export type Content = z.infer<typeof contentSchema>;
export type Profile = Content["profile"];
export type Sections = Content["sections"];
export type SectionCopy = Sections["about"];
export type Skills = Content["skills"];
export type Role = Content["experience"][number];
export type Project = Content["projects"][number];
export type Shot = Project["screenshots"][number];
export type SliceKey = keyof Content;

/** Turns a zod error into a short, readable message for the admin UI. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 4)
    .map((i) => {
      const where = i.path
        .filter((p) => typeof p !== "number")
        .map(String)
        .join(" › ");
      return where ? `${where}: ${i.message}` : i.message;
    })
    .join(" · ");
}
