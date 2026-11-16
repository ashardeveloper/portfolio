import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/Editor";
import { getAdminContent } from "@/lib/content";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = (await getAdminContent()).projects.find((p) => p.id === id);
  if (!project) notFound();

  return <ProjectEditor key={project.id} project={project} />;
}
