import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectDetailFromSearchParams } from "@/components/projects/ProjectDetailFromSearchParams";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";

function ProjectDetailFallback() {
  return (
    <AppShell>
      <SkeletonProjectCard />
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonProjectCard key={index} />
        ))}
      </div>
    </AppShell>
  );
}

export default function ProjectRoute() {
  return (
    <RequireAuth>
      <Suspense fallback={<ProjectDetailFallback />}>
        <ProjectDetailFromSearchParams />
      </Suspense>
    </RequireAuth>
  );
}
