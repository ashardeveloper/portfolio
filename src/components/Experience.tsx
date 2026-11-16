import type { Content, SectionCopy } from "@/lib/schema";
import { Reveal } from "./motion";
import { SectionHeading } from "./SectionHeading";

export function Experience({
  experience,
  education,
  certifications,
  section,
}: {
  experience: Content["experience"];
  education: Content["education"];
  certifications: Content["certifications"];
  section: SectionCopy;
}) {
  return (
    <section id="experience" className="section">
      <SectionHeading index="03" eyebrow={section.eyebrow} title={section.title} lead={section.lead} />

      <ol className="relative ml-2 border-l border-line pl-7 sm:ml-3 sm:pl-10">
        {experience.map((role, i) => (
          <li key={role.id} className="relative pb-10 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[2.07rem] top-7 size-3 rounded-full ring-4 ring-bg sm:-left-[2.82rem] ${
                i === 0 ? "bg-accent shadow-[0_0_14px_2px_rgb(139_92_246/0.8)]" : "bg-faint"
              }`}
            />
            <Reveal delay={0.05}>
              <article className="glass rounded-2xl p-6 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-display text-xl font-semibold sm:text-2xl">{role.title}</h3>
                  <p className="font-mono text-xs text-cyan sm:text-sm">{role.period}</p>
                </div>
                <p className="mt-1 text-muted">{role.company}</p>

                {role.summary && <p className="mt-4 leading-relaxed text-ink/90">{role.summary}</p>}

                {role.metrics.length > 0 && (
                  
                  <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Key results">
                    {role.metrics.map((m) => (
                      <li key={m.id} className="rounded-xl border border-violet/25 bg-violet/10 px-3 py-3 text-center">
                        <p className="text-gradient font-display text-xl font-bold sm:text-3xl">{m.value}</p>
                        <p className="mt-0.5 font-mono text-[0.68rem] uppercase tracking-wider text-muted">{m.label}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-5 space-y-2.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex gap-3 leading-relaxed text-muted">
                      <span aria-hidden className="bg-accent mt-[0.6rem] size-1.5 shrink-0 rounded-full" />
                      {b}
                    </li>
                  ))}
                </ul>

                {role.stack.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                    {role.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <Reveal>
          <h3 className="font-display text-2xl font-semibold">Education</h3>
          <ul className="mt-5 space-y-4">
            {education.map((e) => (
              <li key={e.id} className="glass rounded-2xl p-5">
                <p className="font-mono text-xs text-cyan">{e.period}</p>
                <p className="mt-1.5 font-display text-lg font-semibold">{e.degree}</p>
                <p className="text-muted">{e.school}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <h3 className="font-display text-2xl font-semibold">Certifications &amp; achievements</h3>
          <ul className="mt-5 space-y-3">
            {certifications.map((c) => (
              <li key={c.id} className="glass flex items-start justify-between gap-4 rounded-2xl p-5">
                <div>
                  <p className="font-medium leading-snug">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">{c.issuer}</p>
                </div>
                <p className="shrink-0 font-mono text-xs text-faint">{c.date}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
