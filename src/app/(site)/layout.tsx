import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Rendered per request, so the site always shows the content saved in the admin and
// the build never needs to reach the database.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const title = `${profile.name} — ${profile.role}`;
  const description = [
    `${profile.name} — ${profile.role}${profile.location ? ` in ${profile.location}` : ""}.`,
    profile.bio[0] ?? "",
    profile.availability.enabled ? `${profile.availability.badge}: ${profile.availability.short}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: { default: title, template: `%s — ${profile.name}` },
    description,
    authors: [{ name: profile.name, url: profile.linkedin || undefined }],
    openGraph: { type: "website", title, description, siteName: profile.name, url: "/" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: "/" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, education } = await getContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteUrl,
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    ...(profile.photo ? { image: `${siteUrl}${profile.photo}` } : {}),
    ...(profile.locationFull ? { address: profile.locationFull } : {}),
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    knowsLanguage: profile.languages.map((l) => l.name),
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <Navbar profile={{ name: profile.name, initials: profile.initials, cv: profile.cv }} />
      <main id="main">{children}</main>
      <Footer profile={profile} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
