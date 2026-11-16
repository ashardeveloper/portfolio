import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { getAdminContent } from "@/lib/content";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { projects } = await getAdminContent();
  return <ProjectsManager projects={projects} />;
}
