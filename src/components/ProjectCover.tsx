import Image from "next/image";
import { isUpload } from "@/lib/site";
import type { Project } from "@/lib/schema";

/**
 * Card / hero cover for a project: its first screenshot, or a generated
 * gradient cover while screenshots are still missing.
 */
export function ProjectCover({
  project,
  sizes,
  priority = false,
  className = "",
}: {
  project: Project;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const cover = project.screenshots[0];
  const { from, to } = project.accent;

  if (cover) {
    return (
      <div className={`relative overflow-hidden bg-raised ${className}`}>
        <Image
          src={cover.src}
          unoptimized={isUpload(cover.src)}
          alt={`${project.title} — ${cover.caption}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}33 0%, #0d0f18 45%, ${to}33 100%)` }}
      role="img"
      aria-label={`${project.title} cover`}
    >
      <div aria-hidden className="grid-fade absolute inset-0" />
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-48 rounded-full opacity-50 blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{ background: from }}
      />
      <div
        aria-hidden
        className="absolute -bottom-12 -left-8 size-44 rounded-full opacity-40 blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{ background: to }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/60">{project.subtitle}</p>
        <p className="font-display text-2xl font-bold sm:text-3xl">{project.title}</p>
      </div>
    </div>
  );
}
