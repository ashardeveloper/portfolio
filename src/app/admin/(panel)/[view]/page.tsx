import { notFound } from "next/navigation";
import { SliceEditor, type EditorView } from "@/components/admin/Editor";
import { getAdminContent } from "@/lib/content";
import type { Content } from "@/lib/schema";

/** Which part of the content each editor page works on. */
const pick: Record<EditorView, (c: Content) => unknown> = {
  hero: (c) => c.profile,
  about: (c) => c.profile,
  skills: (c) => c.skills,
  experience: (c) => c.experience,
  education: (c) => c.education,
  certifications: (c) => c.certifications,
  sections: (c) => c.sections,
};

export default async function EditorPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!Object.hasOwn(pick, view)) notFound();
  const key = view as EditorView;
  const content = await getAdminContent();

  return <SliceEditor key={key} view={key} initial={pick[key](content)} />;
}
