import { ProjectDetailPage } from "@/components/projects/ProjectDetailPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

type ProjectRouteProps = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export function generateStaticParams() {
  return [
    {
      owner: "_",
      repo: "_",
    },
  ];
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { owner, repo } = await params;
  return (
    <AppProviders>
      <RequireAuth>
        <ProjectDetailPage owner={owner} repo={repo} />
      </RequireAuth>
    </AppProviders>
  );
}
