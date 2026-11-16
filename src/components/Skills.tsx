"use client";

import dynamic from "next/dynamic";
import type { SectionCopy, Skills as SkillsData } from "@/lib/schema";
import { Reveal, useCan3D, useOnScreen } from "./motion";
import { SectionHeading } from "./SectionHeading";

const SkillsCloud = dynamic(() => import("./SkillsCloud"), { ssr: false });

export function Skills({ skills, section }: { skills: SkillsData; section: SectionCopy }) {
  const cloudSkills = skills.cloud;
  const skillGroups = skills.groups;
  const can3D = useCan3D();
  const [ref, visible] = useOnScreen<HTMLDivElement>();

  return (
    <section id="skills" className="section">
      <SectionHeading
        index="02"
        eyebrow={section.eyebrow}
        title={section.title}
        lead={section.lead}
      />

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        {/* 3D cloud on capable desktops; plain grid of the same skills elsewhere. */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <div ref={ref} className="glass relative aspect-square overflow-hidden rounded-3xl">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(139_92_246/0.18),transparent_65%)]"
            />
            {can3D ? (
              <div className="absolute inset-0 cursor-grab" aria-hidden>
                <SkillsCloud skills={cloudSkills} active={visible} />
              </div>
            ) : (
              <ul className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-6" aria-hidden>
                {cloudSkills.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.68rem] text-faint">
              {can3D ? "move your cursor to spin" : "core stack"}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {skillGroups.map((g, i) => (
            <Reveal key={g.id} delay={(i % 2) * 0.08} className={g.items.length > 10 ? "sm:col-span-2" : ""}>
              <div className="glass h-full rounded-2xl p-5 transition-colors hover:border-violet/40">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <span className="bg-accent size-1.5 rounded-full" />
                  {g.title}
                  <span className="ml-auto font-mono text-xs font-normal text-faint">{g.items.length}</span>
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
