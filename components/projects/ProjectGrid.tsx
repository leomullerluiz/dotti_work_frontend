import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { getRemoteListUiState } from "@/services/dotti/remoteUiState";
import type { MatchedProject } from "@/types";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid({
  projects,
  isLoading,
}: {
  projects: MatchedProject[];
  isLoading?: boolean;
}) {
  const state = getRemoteListUiState({
    isLoading,
    itemCount: projects.length,
  });

  if (state === "loading") {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonProjectCard key={index} />
        ))}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <EmptyState
        title="No projects match these filters"
        description="Try relaxing the filters or refreshing matches. Ignored projects can be restored from the history page."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
