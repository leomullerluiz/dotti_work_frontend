"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Eye,
  GitFork,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AnimatedArticle } from "@/components/ui/AnimatedSurface";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import type { MatchedProject } from "@/types";
import { formatNumber, timeAgo } from "@/utils/format";
import { DifficultyBadge } from "./DifficultyBadge";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { RepositoryAvatar } from "./RepositoryAvatar";
import { StackBadge } from "./StackBadge";

export function ProjectCard({ project }: { project: MatchedProject }) {
  const { saveProject, removeProject, isSaved } = useSavedProjects();
  const { ignoreProject } = useMatches();
  const { addHistory } = useHistory();
  const saved = isSaved(project.id);
  const projectName = `${project.owner}/${project.repo}`;

  const registerViewed = () => {
    addHistory({
      type: "Viewed project",
      repositoryId: project.id,
      repositoryName: projectName,
    });
  };

  const registerOpenedGithub = () => {
    addHistory({
      type: "Opened GitHub",
      repositoryId: project.id,
      repositoryName: projectName,
    });
  };

  return (
    <AnimatedArticle className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-coral-300 hover:shadow-xl hover:shadow-coral-500/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-coral-400/40">
      <div className="flex items-start gap-4">
        <RepositoryAvatar
          owner={project.owner}
          repo={project.repo}
          color={project.avatarColor}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${project.owner}/${project.repo}`}
              onClick={registerViewed}
              className="truncate text-base font-semibold text-zinc-950 transition hover:text-coral-600 dark:text-white dark:hover:text-coral-300"
            >
              {project.name}
            </Link>
            <MatchScoreBadge score={project.matchScore} />
            <DifficultyBadge difficulty={project.difficulty} />
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {projectName}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {project.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.languages.slice(0, 4).map((language) => (
          <StackBadge key={language}>{language}</StackBadge>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.topics.slice(0, 4).map((topic) => (
          <Badge key={topic}>{topic}</Badge>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-4">
        <span className="flex items-center gap-1.5">
          <Star size={15} />
          {formatNumber(project.stars)}
        </span>
        <span className="flex items-center gap-1.5">
          <GitFork size={15} />
          {formatNumber(project.forks)}
        </span>
        <span>{project.openIssues} issues</span>
        <span>{project.goodFirstIssues} first issues</span>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Why it matches
        </p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          {project.matchReasons.slice(0, 2).map((reason) => (
            <li key={reason}>- {reason}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Recommended for {project.recommendedLevel} - updated{" "}
          {timeAgo(project.lastUpdated)}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.owner}/${project.repo}`}
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
            onClick={() => {
              void (saved
                ? removeProject(project.id)
                : saveProject(project.id, project));
            }}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              void ignoreProject(project.id);
            }}
          >
            <X size={15} />
            Ignore
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
