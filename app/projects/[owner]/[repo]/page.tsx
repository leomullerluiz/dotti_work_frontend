import { ProjectDetailPage } from "@/components/projects/ProjectDetailPage";
import { AppProviders } from "@/contexts/AppProviders";
import { findProject, mockProjects } from "@/data/repositories";

type ProjectRouteProps = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export function generateStaticParams() {
  return mockProjects.map((project) => ({
    owner: project.owner,
    repo: project.repo,
  }));
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { owner, repo } = await params;
  return (
    <AppProviders>
      <ProjectDetailPage project={findProject(owner, repo)} />
    </AppProviders>
  );
}
