"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectDetailPage } from "./ProjectDetailPage";

export function ProjectDetailFromSearchParams() {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();

  if (!owner || !repo) {
    return (
      <AppShell>
        <EmptyState
          title="Project route is incomplete"
          description="Open a repository from Matches so dotti.work can load its owner and repository name."
          action={
            <Link href="/matches" className={buttonClasses()}>
              Back to matches
            </Link>
          }
        />
      </AppShell>
    );
  }

  return <ProjectDetailPage owner={owner} repo={repo} />;
}
