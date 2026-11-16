import { newId, type FieldDef, type Obj } from "./fields";

/** Form definitions for every admin editor. Shapes mirror src/lib/schema.ts. */

const s = (v: unknown) => String(v ?? "");

export const heroFields: FieldDef[] = [
  { type: "heading", label: "Identity", help: "Shown in the hero, the navigation bar, the footer and search results." },
  { type: "text", key: "name", label: "Full name", half: true },
  { type: "text", key: "initials", label: "Logo initials", half: true, help: "Shown top-left in the navigation." },
  { type: "text", key: "role", label: "Key role", help: "The main line under your name." },
  { type: "tags", key: "rotatingRoles", label: "Rotating roles", help: "Typed out one after another under your key role." },
  { type: "text", key: "tagline", label: "Tagline", half: true },
  { type: "text", key: "focus", label: "Focus line", half: true },
  { type: "text", key: "location", label: "Location (short)", half: true },
  { type: "text", key: "locationFull", label: "Location (full)", half: true, help: "Used for search engines." },

  { type: "heading", label: "Photo" },
  { type: "upload", key: "photo", label: "Portrait", accept: "image", folder: "profile", help: "Square images work best. Shown in a circle." },
  { type: "text", key: "photoBadge", label: "Badge on the photo", help: "Leave empty to hide it." },

  { type: "heading", label: "Availability" },
  {
    type: "group",
    key: "availability",
    label: "Open-to-work badge",
    fields: [
      { type: "boolean", key: "enabled", label: "Show the availability badge", help: "Appears in the hero and the contact section." },
      { type: "text", key: "badge", label: "Badge text", half: true },
      { type: "text", key: "short", label: "Short detail", half: true },
      { type: "textarea", key: "long", label: "Full sentence", help: "Shown in About and Contact." },
    ],
  },

  { type: "heading", label: "Contact and links" },
  { type: "email", key: "email", label: "Public email", half: true },
  { type: "url", key: "github", label: "GitHub URL", half: true },
  { type: "url", key: "linkedin", label: "LinkedIn URL", half: true },
  { type: "upload", key: "cv", label: "CV (PDF)", accept: "document", folder: "profile", help: "Anyone can download this file, including any phone number in it." },
];

export const aboutFields: FieldDef[] = [
  { type: "lines", key: "bio", label: "Bio paragraphs", addLabel: "Add paragraph" },
  {
    type: "list",
    key: "stats",
    label: "Stat counters",
    help: "Animated numbers beside your bio.",
    addLabel: "Add stat",
    itemTitle: (i) => `${s(i.value)}${s(i.suffix)} ${s(i.label)}`,
    newItem: () => ({ id: newId(), value: 0, suffix: "", label: "New stat" }),
    fields: [
      { type: "number", key: "value", label: "Number", half: true },
      { type: "text", key: "suffix", label: "Suffix", half: true, placeholder: "+" },
      { type: "text", key: "label", label: "Label" },
    ],
  },
  { type: "tags", key: "learning", label: "Now learning", help: "Shown as a strip under your bio. Leave empty to hide it." },
  {
    type: "list",
    key: "languages",
    label: "Languages",
    help: "Shown as chips in the hero.",
    addLabel: "Add language",
    itemTitle: (i) => `${s(i.name)} ${s(i.level)}`,
    itemMeta: (i) => s(i.note),
    newItem: () => ({ id: newId(), name: "Language", level: "", note: "" }),
    fields: [
      { type: "text", key: "name", label: "Language", half: true },
      { type: "text", key: "level", label: "Level", half: true, placeholder: "C1" },
      { type: "text", key: "note", label: "Note", placeholder: "IELTS 7.0" },
    ],
  },
];

export const skillsFields: FieldDef[] = [
  {
    type: "list",
    key: "groups",
    label: "Skill groups",
    addLabel: "Add skill group",
    itemTitle: (i) => s(i.title),
    itemMeta: (i) => `${(i.items as string[]).length} skills`,
    newItem: () => ({ id: newId(), title: "New group", items: [] }),
    fields: [
      { type: "text", key: "title", label: "Group title" },
      { type: "tags", key: "items", label: "Skills", help: "Press Enter after each skill, or paste a comma-separated list." },
    ],
  },
  { type: "tags", key: "cloud", label: "3D skills cloud", help: "Short labels shown on the rotating sphere. Around 20–25 looks best." },
];

const experienceItem: FieldDef[] = [
  { type: "text", key: "title", label: "Job title", half: true },
  { type: "text", key: "company", label: "Company", half: true },
  { type: "text", key: "period", label: "Period", placeholder: "May 2024 – Present" },
  { type: "textarea", key: "summary", label: "Summary", help: "One or two sentences. Optional." },
  { type: "lines", key: "bullets", label: "Impact bullets", addLabel: "Add bullet" },
  { type: "tags", key: "stack", label: "Tech stack" },
  {
    type: "list",
    key: "metrics",
    label: "Highlighted metrics",
    help: "Up to four large numbers shown on the card. Optional.",
    addLabel: "Add metric",
    itemTitle: (i) => `${s(i.value)} ${s(i.label)}`,
    newItem: () => ({ id: newId(), value: "0", label: "label" }),
    fields: [
      { type: "text", key: "value", label: "Value", half: true, placeholder: "19.31x" },
      { type: "text", key: "label", label: "Label", half: true, placeholder: "ROAS" },
    ],
  },
];

export const experienceFields: FieldDef[] = [
  {
    type: "list",
    key: "items",
    label: "Roles",
    help: "Shown newest first, in this order.",
    addLabel: "Add role",
    itemTitle: (i) => s(i.title),
    itemMeta: (i) => `${s(i.company)} · ${s(i.period)}`,
    newItem: () => ({ id: newId(), title: "New role", company: "Company", period: "Year – Year", summary: "", bullets: [], stack: [], metrics: [] }),
    fields: experienceItem,
  },
];

export const educationFields: FieldDef[] = [
  {
    type: "list",
    key: "items",
    label: "Education",
    addLabel: "Add education",
    itemTitle: (i) => s(i.degree),
    itemMeta: (i) => `${s(i.school)} · ${s(i.period)}`,
    newItem: () => ({ id: newId(), degree: "Degree", school: "University", period: "Year – Year" }),
    fields: [
      { type: "text", key: "degree", label: "Degree" },
      { type: "text", key: "school", label: "School" },
      { type: "text", key: "period", label: "Period", placeholder: "Oct 2024 – Present" },
    ],
  },
];

export const certificationFields: FieldDef[] = [
  {
    type: "list",
    key: "items",
    label: "Certifications and achievements",
    addLabel: "Add certification",
    itemTitle: (i) => s(i.title),
    itemMeta: (i) => [s(i.issuer), s(i.date)].filter(Boolean).join(" · "),
    newItem: () => ({ id: newId(), title: "New certification", issuer: "", date: "" }),
    fields: [
      { type: "text", key: "title", label: "Title" },
      { type: "text", key: "issuer", label: "Issuer or detail", half: true },
      { type: "text", key: "date", label: "Date", half: true, placeholder: "Jan 2024" },
    ],
  },
];

const sectionGroup = (key: string, label: string): FieldDef => ({
  type: "group",
  key,
  label,
  fields: [
    { type: "boolean", key: "visible", label: "Show this section on the site" },
    { type: "text", key: "eyebrow", label: "Small label", half: true },
    { type: "text", key: "title", label: "Heading", half: true },
    { type: "textarea", key: "lead", label: "Intro text", rows: 2, help: "Optional." },
  ],
});

export const sectionsFields: FieldDef[] = [
  sectionGroup("about", "About"),
  sectionGroup("skills", "Skills"),
  sectionGroup("experience", "Experience, education and certifications"),
  sectionGroup("projects", "Projects"),
  sectionGroup("contact", "Contact"),
];

export const projectFields = (folder: string): FieldDef[] => [
  { type: "heading", label: "Basics" },
  { type: "text", key: "title", label: "Title", half: true },
  { type: "text", key: "subtitle", label: "Subtitle", half: true, placeholder: "SaaS Invoice Management" },
  { type: "text", key: "slug", label: "Page address", half: true, help: "The case study lives at /projects/<address>. Lowercase letters, numbers and hyphens." },
  { type: "text", key: "year", label: "Year", half: true },
  { type: "textarea", key: "oneLiner", label: "One-line summary", rows: 2 },
  { type: "boolean", key: "published", label: "Published", help: "Hidden projects do not appear on the site." },
  { type: "boolean", key: "flagship", label: "Flagship project", help: "Shown first as the large card. Only one project can be the flagship." },

  { type: "heading", label: "Links" },
  { type: "url", key: "live", label: "Live demo URL", half: true, help: "Leave empty to hide the button." },
  { type: "url", key: "github", label: "GitHub URL", half: true },

  { type: "heading", label: "Screenshots", help: "The first screenshot is the cover on the card and the case study." },
  { type: "shots", key: "screenshots", label: "Gallery", folder },
  {
    type: "group",
    key: "accent",
    label: "Cover colours",
    help: "Used for the generated cover when there is no screenshot.",
    fields: [
      { type: "color", key: "from", label: "From", half: true },
      { type: "color", key: "to", label: "To", half: true },
    ],
  },

  { type: "heading", label: "Case study" },
  { type: "textarea", key: "problem", label: "Problem", rows: 3 },
  { type: "textarea", key: "solution", label: "Solution", rows: 4 },
  { type: "lines", key: "engineering", label: "Engineering focus", addLabel: "Add point" },
  { type: "lines", key: "features", label: "Features", addLabel: "Add feature" },
  {
    type: "list",
    key: "apps",
    label: "Sub-apps",
    help: "For a project made of several apps. Highlighted ones are listed on the home-page card.",
    addLabel: "Add app",
    itemTitle: (i: Obj) => s(i.name),
    itemMeta: (i: Obj) => [i.highlight ? "Highlighted" : "", s(i.metric)].filter(Boolean).join(" · "),
    newItem: () => ({ id: newId(), name: "New app", detail: "", metric: "", highlight: false }),
    fields: [
      { type: "text", key: "name", label: "Name" },
      { type: "textarea", key: "detail", label: "Description", rows: 2 },
      { type: "text", key: "metric", label: "Headline metric", half: true, placeholder: "60,000x" },
      { type: "boolean", key: "highlight", label: "Highlight on the home page" },
    ],
  },
  { type: "textarea", key: "note", label: "Scope note", rows: 2, help: "For example, limits or disclaimers. Optional." },

  { type: "heading", label: "Tech stack" },
  { type: "tags", key: "stack", label: "Full stack", help: "Shown on the case-study page." },
  { type: "tags", key: "cardStack", label: "Card stack", help: "The 4–6 most important, shown on the home-page card." },

  { type: "heading", label: "To-do notes", help: "Shown on the site as amber TODO markers until you remove them." },
  { type: "lines", key: "todos", label: "Outstanding items", addLabel: "Add to-do" },
];
