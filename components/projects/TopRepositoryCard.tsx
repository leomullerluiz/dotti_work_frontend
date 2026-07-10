"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  CircleDot,
  ExternalLink,
  Eye,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AnimatedArticle } from "@/components/ui/AnimatedSurface";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useHistory } from "@/hooks/useHistory";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { adaptApiTopRepositoryItemToMatchedProject } from "@/services/dotti/adapters";
import type {
  ApiRepositoryStateValue,
  ApiTopRepositoryItem,
  ApiTopRepositorySortBy,
} from "@/services/dotti/types";
import { formatNumber } from "@/utils/format";
import { projectDetailHref } from "@/utils/projectRoutes";
import { RepositoryAvatar } from "./RepositoryAvatar";
import { StackBadge } from "./StackBadge";

const metricLabels: Record<ApiTopRepositorySortBy, string> = {
  stars: "Stars",
  open_issues: "Open issues",
  contributors: "Contributors",
};

const stateLabels: Record<ApiRepositoryStateValue, string> = {
  saved: "Saved",
  ignored: "Ignored",
  researching: "Researching",
  working: "Working",
  pull_request_sent: "PR sent",
  contributed: "Contributed",
  archived: "Archived",
};

export function TopRepositoryCard({
  item,
  activeSort,
}: {
  item: ApiTopRepositoryItem;
  activeSort: ApiTopRepositorySortBy;
}) {
  const project = adaptApiTopRepositoryItemToMatchedProject(item);
  const { saveProject, removeProject, isSaved } = useSavedProjects();
  const { addHistory } = useHistory();
  const repositoryId =
    item.repository.github_repository_id !== null &&
    item.repository.github_repository_id !== undefined
      ? String(item.repository.github_repository_id)
      : project.id;
  const canSave =
    item.repository.github_repository_id !== null &&
    item.repository.github_repository_id !== undefined;
  const saved = isSaved(repositoryId) || item.user_state === "saved";
  const repositoryName = `${project.owner}/${project.repo}`;
  const detailHref = projectDetailHref(project.owner, project.repo);
  const metricType = item.rank_metric.type ?? activeSort;
  const metricValue = item.rank_metric.value ?? metricValueFor(activeSort, project);

  const registerViewed = () => {
    addHistory({
      type: "Viewed project",
      repositoryId,
      repositoryName,
    });
  };

  const registerOpenedGithub = () => {
    addHistory({
      type: "Opened GitHub",
      repositoryId,
      repositoryName,
    });
  };

  return (
    <AnimatedArticle className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-coral-300 hover:shadow-xl hover:shadow-coral-500/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-coral-400/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="rounded-lg border border-coral-400/30 bg-coral-400/10 px-2.5 py-1 text-sm font-semibold text-coral-700 dark:text-coral-200">
              #{item.rank}
            </div>
            <RepositoryAvatar
              owner={project.owner}
              repo={project.repo}
              color={project.avatarColor}
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={detailHref}
                onClick={registerViewed}
                className="truncate text-base font-semibold text-zinc-950 transition hover:text-coral-600 dark:text-white dark:hover:text-coral-300"
              >
                {repositoryName}
              </Link>
              {item.user_state ? (
                <Badge tone={item.user_state === "ignored" ? "danger" : "accent"}>
                  {stateLabels[item.user_state]}
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {project.description || "No description available for this repository."}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left dark:border-white/10 dark:bg-black/20 lg:min-w-44">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {metricLabels[metricType]}
          </p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
            {formatNumber(metricValue)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.languages.slice(0, 4).map((language) => (
          <StackBadge key={language}>{language}</StackBadge>
        ))}
        {project.topics.slice(0, 5).map((topic) => (
          <Badge key={topic}>{topic}</Badge>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <Star size={15} />
          {formatNumber(project.stars)}
        </span>
        <span className="flex items-center gap-1.5">
          <CircleDot size={15} />
          {formatNumber(project.openIssues)} issues
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={15} />
          {formatNumber(project.contributors ?? 0)}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {project.goodFirstIssues} good first issues - {project.helpWantedIssues} help wanted
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={detailHref}
            onClick={registerViewed}
            className={buttonClasses({ variant: "outline", size: "sm" })}
          >
            <Eye size={15} />
            Details
          </Link>
          <Button
            type="button"
            variant={saved ? "outline" : "primary"}
            size="sm"
            disabled={!canSave}
            title={
              canSave ? undefined : "Repository does not include a GitHub ID to save."
            }
            onClick={() => {
              if (!canSave) {
                return;
              }

              void (saved
                ? removeProject(repositoryId)
                : saveProject(repositoryId, project));
            }}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            {saved ? "Saved" : "Save"}
          </Button>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            onClick={registerOpenedGithub}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ExternalLink size={15} />
            GitHub
          </a>
        </div>
      </div>
    </AnimatedArticle>
  );
}

function metricValueFor(
  sortBy: ApiTopRepositorySortBy,
  project: ReturnType<typeof adaptApiTopRepositoryItemToMatchedProject>,
) {
  if (sortBy === "open_issues") {
    return project.openIssues;
  }

  if (sortBy === "contributors") {
    return project.contributors ?? 0;
  }

  return project.stars;
}
