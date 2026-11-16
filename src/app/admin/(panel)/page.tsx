import Link from "next/link";
import { getAdminContent, storageStatus } from "@/lib/content";

export default async function Dashboard() {
  const content = await getAdminContent();
  const { profile, sections, projects } = content;
  const storage = storageStatus();

  const cards = [
    { href: "/admin/projects", label: "Projects", value: projects.length, note: `${projects.filter((p) => p.published).length} published` },
    { href: "/admin/experience", label: "Roles", value: content.experience.length, note: "Experience" },
    { href: "/admin/skills", label: "Skills", value: content.skills.groups.reduce((n, g) => n + g.items.length, 0), note: `${content.skills.groups.length} groups` },
    { href: "/admin/education", label: "Education", value: content.education.length, note: "Degrees" },
    { href: "/admin/certifications", label: "Certifications", value: content.certifications.length, note: "And achievements" },
    { href: "/admin/about", label: "Stat counters", value: profile.stats.length, note: "In About" },
  ];

  // Things worth fixing before the site goes live.
  const attention: { text: string; href: string }[] = [];
  if (!profile.photo) attention.push({ text: "No portrait photo is set.", href: "/admin/hero" });
  if (!profile.cv) attention.push({ text: "No CV is attached, so the Download CV button has nothing to serve.", href: "/admin/hero" });
  if (!profile.email) attention.push({ text: "No public email is set.", href: "/admin/hero" });
  for (const p of projects) {
    if (p.todos.length) attention.push({ text: `${p.title}: ${p.todos.length} to-do item${p.todos.length === 1 ? "" : "s"} showing on the site.`, href: `/admin/projects/${p.id}` });
    if (!p.published) attention.push({ text: `${p.title} is hidden.`, href: `/admin/projects/${p.id}` });
    else if (!p.screenshots.length) attention.push({ text: `${p.title} has no screenshots.`, href: `/admin/projects/${p.id}` });
  }
  const hidden = Object.entries(sections).filter(([, s]) => !s.visible);
  if (hidden.length) attention.push({ text: `Hidden sections: ${hidden.map(([k]) => k).join(", ")}.`, href: "/admin/sections" });

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back, {profile.name.split(" ")[0]}</h1>
        <p className="mt-1.5 text-sm text-muted">Edit any part of your portfolio. Saved changes appear on the site straight away.</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
          <span aria-hidden className={`size-1.5 rounded-full ${storage.error ? "bg-todo" : "bg-emerald-400"}`} />
          Storage: {storage.mode === "database" ? (storage.error ? "database (not reachable)" : "MySQL database") : "files in data/"}
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="glass block rounded-2xl p-5 transition-colors hover:border-violet/50">
              <p className="text-gradient font-display text-4xl font-bold tabular-nums">{c.value}</p>
              <p className="mt-1.5 text-sm font-medium">{c.label}</p>
              <p className="text-xs text-faint">{c.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Needs attention</h2>
        {attention.length === 0 ? (
          <p className="glass mt-4 rounded-2xl px-5 py-6 text-sm text-emerald-300">Nothing outstanding.</p>
        ) : (
          <ul className="glass mt-4 divide-y divide-line rounded-2xl">
            {attention.map((a) => (
              <li key={a.text}>
                <Link href={a.href} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm hover:bg-white/[0.03]">
                  <span className="flex items-start gap-3">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-todo" />
                    {a.text}
                  </span>
                  <span className="shrink-0 text-xs text-cyan">Fix →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Sections on the site</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { key: "hero", name: "Hero", href: "/admin/hero", visible: true },
            { key: "about", name: "About", href: "/admin/about", visible: sections.about.visible },
            { key: "skills", name: "Skills", href: "/admin/skills", visible: sections.skills.visible },
            { key: "experience", name: "Experience", href: "/admin/experience", visible: sections.experience.visible },
            { key: "projects", name: "Projects", href: "/admin/projects", visible: sections.projects.visible },
            { key: "contact", name: "Contact", href: "/admin/hero", visible: sections.contact.visible },
          ].map((s) => (
            <li key={s.key}>
              <Link href={s.href} className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm hover:border-violet/50">
                <span className="font-medium">{s.name}</span>
                <span className={`font-mono text-xs ${s.visible ? "text-emerald-300" : "text-faint"}`}>{s.visible ? "Visible" : "Hidden"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
