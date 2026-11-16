import type { Profile, SectionCopy } from "@/lib/schema";
import { Counter, Reveal } from "./motion";
import { SectionHeading } from "./SectionHeading";

export function About({ profile, section }: { profile: Profile; section: SectionCopy }) {
  return (
    <section id="about" className="section">
      <SectionHeading index="01" eyebrow={section.eyebrow} title={section.title} lead={section.lead} />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {profile.availability.enabled && profile.availability.long && (
              <p className="text-ink">{profile.availability.long}</p>
            )}
          </div>

          {profile.learning.length > 0 && (
            <div className="mt-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">Now learning</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.learning.map((l) => (
                  <li key={l} className="chip border-violet/30 bg-violet/10 text-violet-200">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        <div className="grid grid-cols-2 content-start gap-4">
          {profile.stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <div className="glass h-full rounded-2xl p-5 sm:p-6">
                <p className="text-gradient font-display text-4xl font-bold sm:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
