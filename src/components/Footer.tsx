import type { Profile } from "@/lib/schema";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[76rem] flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint md:flex-row md:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <p className="font-mono text-xs">Built with Next.js, TypeScript, Tailwind CSS and Three.js</p>
        <div className="flex items-center gap-4">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-ink">
            <GitHubIcon />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-ink">
            <LinkedInIcon />
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="hover:text-ink">
            <MailIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
