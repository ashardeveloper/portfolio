import type { MetadataRoute } from "next";
import { getContent, visibleProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = visibleProjects(await getContent());
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
