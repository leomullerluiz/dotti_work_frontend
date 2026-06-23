"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  GitFork,
  Share2,
  Star,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import type { MatchedProject } from "@/types";
import { formatNumber, timeAgo } from "@/utils/format";
import { ContributionReadinessCard } from "./ContributionReadinessCard";
import { DifficultyBadge } from "./DifficultyBadge";
import { IssueCard } from "./IssueCard";
import { RepositoryAvatar } from "./RepositoryAvatar";
import { RepositoryHealthCard } from "./RepositoryHealthCard";
import { StackBadge } from "./StackBadge";

export function ProjectDetailPage({ project }: { project?: MatchedProject }) {
  const { addHistory } = useHistory();
  const { saveProject, removeProject, isSaved, updateStatus } = useSavedProjects();
  const { ignoreProject } = useMatches();

  useEffect(() => {
    if (!project) {
      return;
    }

    addHistory({
      type: "Viewed project",
      repositoryId: project.id,
      repositoryName: `${project.owner}/${project.repo}`,
    });
  }, [addHistory, project]);

  if (!project) {
    return (
      <AppShell>
        <EmptyState
          title="Project not found"
          description="This mock repository does not exist in the local fixture catalog."
          action={
            <Link href="/matches" className={buttonClasses()}>
              Back to matches
            </Link>
          }
        />
      </AppShell>
    );
  }

  const saved = isSaved(project.id);
  const repositoryName = `${project.owner}/${project.repo}`;

  const openGithub = () => {
    addHistory({
      type: "Opened GitHub",
      repositoryId: project.id,
      repositoryName,
    });
  };

  const shareProject = async () => {
    if (navigator.share) {
      await navigator.share({
        title: repositoryName,
        text: project.description,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Project details"
        title={repositoryName}
        description={project.description}
        actions={
          <>
            <Button
              type="button"
              variant={saved ? "outline" : "primary"}
              onClick={() => (saved ? removeProject(project.id) : saveProject(project.id))}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? "Saved" : "Save project"}
            </Button>
            <Button type="button" variant="outline" onClick={() => ignoreProject(project.id)}>
              <X size={16} />
              Ignore
            </Button>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={openGithub}
              className={buttonClasses({ variant: "secondary" })}
            >
              <ExternalLink size={16} />
              Open GitHub
            </a>
          </>
        }
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <RepositoryAvatar
              owner={project.owner}
              repo={project.repo}
              color={project.avatarColor}
              className="size-14 text-base"
            />
            <div>
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty={project.difficulty} />
                <Badge tone="accent">{project.license}</Badge>
                {project.website ? <Badge tone="blue">Website available</Badge> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.languages.map((language) => (
                  <StackBadge key={language}>{language}</StackBadge>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                Updated {timeAgo(project.lastUpdated)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => updateStatus(project.id, "Working")}>
              Mark as contributing
            </Button>
            <Button type="button" variant="outline" onClick={() => updateStatus(project.id, "Contributed")}>
              Mark as contributed
            </Button>
            <Button type="button" variant="ghost" onClick={shareProject}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard label="Stars" value={formatNumber(project.stars)} icon={<Star size={18} />} />
        <StatCard label="Forks" value={formatNumber(project.forks)} icon={<GitFork size={18} />} />
        <StatCard label="Watchers" value={formatNumber(project.watchers)} icon={<Users size={18} />} />
        <StatCard label="Open issues" value={project.openIssues} helper={`${project.goodFirstIssues} good first issues`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <ContributionReadinessCard project={project} />
        <RepositoryHealthCard
          healthScore={project.healthScore}
          checklist={project.healthChecklist}
        />
      </div>

      <section className="mt-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Recommended issues
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Mock issues ranked for contribution fit.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {project.issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              repositoryId={project.id}
              repositoryName={repositoryName}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
