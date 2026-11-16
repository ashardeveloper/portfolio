import { Reveal } from "./motion";

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <Reveal className="mb-12 max-w-2xl md:mb-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
        <span className="text-faint">{index} /</span> {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </Reveal>
  );
}

/** Visible marker for content that still has to be supplied. */
export function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-todo/50 bg-todo/10 px-2 py-1 font-mono text-[0.7rem] leading-tight text-todo">
      <span className="font-bold">TODO</span>
      <span className="text-todo/85">{children}</span>
    </span>
  );
}
