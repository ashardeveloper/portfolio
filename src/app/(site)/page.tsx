import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { mailConfigured } from "@/lib/mail";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { getContent, visibleProjects } from "@/lib/content";

export default async function Home() {
  const content = await getContent();
  const { profile, sections } = content;

  return (
    <>
      <Hero profile={profile} />
      {sections.about.visible && <About profile={profile} section={sections.about} />}
      {sections.skills.visible && <Skills skills={content.skills} section={sections.skills} />}
      {sections.experience.visible && (
        <Experience
          experience={content.experience}
          education={content.education}
          certifications={content.certifications}
          section={sections.experience}
        />
      )}
      {sections.projects.visible && <Projects projects={visibleProjects(content)} section={sections.projects} />}
      {sections.contact.visible && <Contact profile={profile} section={sections.contact} canSend={mailConfigured()} />}
    </>
  );
}
