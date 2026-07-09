import { ProjectDetailPage } from "@/components/projects/ProjectDetailPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
    <RequireAuth>
      <ProjectDetailPage owner={owner} repo={repo} />
    </RequireAuth>
  );
}
