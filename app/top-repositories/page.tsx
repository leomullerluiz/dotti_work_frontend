import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { TopRepositoriesPage } from "@/components/projects/TopRepositoriesPage";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";

function TopRepositoriesFallback() {
  return (
    <AppShell>
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonProjectCard key={index} />
        ))}
      </div>
    </AppShell>
  );
}

export default function TopRepositoriesRoute() {
  return (
    <RequireAuth>
      <Suspense fallback={<TopRepositoriesFallback />}>
        <TopRepositoriesPage />
      </Suspense>
    </RequireAuth>
  );
}
