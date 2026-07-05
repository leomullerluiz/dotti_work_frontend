import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectDetailFromSearchParams } from "@/components/projects/ProjectDetailFromSearchParams";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { AppProviders } from "@/contexts/AppProviders";

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
    <AppProviders>
      <RequireAuth>
        <Suspense fallback={<ProjectDetailFallback />}>
          <ProjectDetailFromSearchParams />
        </Suspense>
      </RequireAuth>
    </AppProviders>
  );
}
