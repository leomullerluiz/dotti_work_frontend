"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { StatCard } from "@/components/ui/StatCard";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import {
  adaptApiRepositoryDetailToMatchedProject,
  adaptApiRepositoryIssue,
} from "@/services/dotti/adapters";
import { DottiApiError } from "@/services/dotti/client";
import {
  getRepository,
  listRepositoryIssues,
  registerRepositoryActivity,
} from "@/services/dotti/repositories";
import type { MatchedProject, ProjectStatus, RepositoryIssue } from "@/types";
import { formatNumber, timeAgo } from "@/utils/format";
import { ContributionReadinessCard } from "./ContributionReadinessCard";
import { DifficultyBadge } from "./DifficultyBadge";
import { IssueCard } from "./IssueCard";
import { RepositoryAvatar } from "./RepositoryAvatar";
import { RepositoryHealthCard } from "./RepositoryHealthCard";
import { StackBadge } from "./StackBadge";

function messageForRepositoryError(error: unknown) {
  if (error instanceof DottiApiError) {
    if (error.status === 404) {
      return "Repository not found.";
    }

    if (error.status === 502 || error.status === 503) {
      return "GitHub or the API is temporarily unavailable. Please retry shortly.";
    }

    return error.message;
  }

  return error instanceof Error
    ? error.message
    : "Could not load repository details.";
}

function isNotFound(error: unknown) {
  return error instanceof DottiApiError && error.status === 404;
}

type ContributionAction = {
  status: ProjectStatus;
  eventType: "started_contributing" | "sent_pull_request" | "marked_contributed";
};

export function ProjectDetailPage({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { addHistory } = useHistory();
  const { saveProject, removeProject, isSaved, updateStatus } = useSavedProjects();
  const { ignoreProject } = useMatches();
  const [repositoryProject, setRepositoryProject] =
    useState<MatchedProject | null>(null);
  const [issues, setIssues] = useState<RepositoryIssue[]>([]);
  const [isRepositoryLoading, setIsRepositoryLoading] = useState(true);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [repositoryNotFound, setRepositoryNotFound] = useState(false);

  const repositoryName = `${owner}/${repo}`;

  const loadRepository = useCallback(async () => {
    setIsRepositoryLoading(true);
    setRepositoryError(null);
    setRepositoryNotFound(false);

    try {
      const detail = await getRepository(owner, repo);
      const nextProject = adaptApiRepositoryDetailToMatchedProject(detail);
      setRepositoryProject(nextProject);

      await registerRepositoryActivity(owner, repo, {
        event_type: "viewed_project",
      }).catch(() => undefined);

      addHistory({
        type: "Viewed project",
        repositoryId: nextProject.id,
        repositoryName,
      });
    } catch (loadError) {
      setRepositoryProject(null);
      setRepositoryNotFound(isNotFound(loadError));
      setRepositoryError(messageForRepositoryError(loadError));
    } finally {
      setIsRepositoryLoading(false);
    }
  }, [addHistory, owner, repo, repositoryName]);

  const loadIssues = useCallback(async () => {
    setIsIssuesLoading(true);
    setIssuesError(null);

    try {
      const response = await listRepositoryIssues(owner, repo, {
        limit: 20,
      });
      setIssues(response.items.map(adaptApiRepositoryIssue));
    } catch (loadError) {
      setIssues([]);
      setIssuesError(messageForRepositoryError(loadError));
    } finally {
      setIsIssuesLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      setIsRepositoryLoading(true);
      setRepositoryError(null);
      setRepositoryNotFound(false);

      try {
        const detail = await getRepository(owner, repo);
        if (!isCurrent) {
          return;
        }

        const nextProject = adaptApiRepositoryDetailToMatchedProject(detail);
        setRepositoryProject(nextProject);

        await registerRepositoryActivity(owner, repo, {
          event_type: "viewed_project",
        }).catch(() => undefined);

        addHistory({
          type: "Viewed project",
          repositoryId: nextProject.id,
          repositoryName,
        });
      } catch (loadError) {
        if (!isCurrent) {
          return;
        }

        setRepositoryProject(null);
        setRepositoryNotFound(isNotFound(loadError));
        setRepositoryError(messageForRepositoryError(loadError));
      } finally {
        if (isCurrent) {
          setIsRepositoryLoading(false);
        }
      }
    }

    void run();

    return () => {
      isCurrent = false;
    };
  }, [addHistory, owner, repo, repositoryName]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      setIsIssuesLoading(true);
      setIssuesError(null);

      try {
        const response = await listRepositoryIssues(owner, repo, {
          limit: 20,
        });
        if (!isCurrent) {
          return;
        }
        setIssues(response.items.map(adaptApiRepositoryIssue));
      } catch (loadError) {
        if (!isCurrent) {
          return;
        }
        setIssues([]);
        setIssuesError(messageForRepositoryError(loadError));
      } finally {
        if (isCurrent) {
          setIsIssuesLoading(false);
        }
      }
    }

    void run();

    return () => {
      isCurrent = false;
    };
  }, [owner, repo]);

  const project = useMemo(() => {
    if (!repositoryProject) {
      return null;
    }

    return {
      ...repositoryProject,
      issues,
    };
  }, [issues, repositoryProject]);

  if (isRepositoryLoading) {
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

  if (!project && repositoryError && !repositoryNotFound) {
    return (
      <AppShell>
        <EmptyState
          title="Could not load repository"
          description={repositoryError}
          action={
            <Button
              type="button"
              onClick={() => {
                void loadRepository();
              }}
            >
              Retry repository
            </Button>
          }
        />
      </AppShell>
    );
  }

  if (!project || repositoryNotFound) {
    return (
      <AppShell>
        <EmptyState
          title="Project not found"
          description={
            repositoryError ??
            "This repository was not found in the dotti.work API."
          }
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

  const registerOpenedGithub = async () => {
    await registerRepositoryActivity(owner, repo, {
      event_type: "opened_github",
    }).catch(() => undefined);
  };

  const openGithub = async () => {
    await registerOpenedGithub();

    addHistory({
      type: "Opened GitHub",
      repositoryId: project.id,
      repositoryName,
    });
  };

  const markContributionStatus = async ({
    status,
    eventType,
  }: ContributionAction) => {
    updateStatus(project.id, status);
    await registerRepositoryActivity(owner, repo, {
      event_type: eventType,
    }).catch(() => undefined);
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
              onClick={() => {
                void openGithub();
              }}
              className={buttonClasses({ variant: "secondary" })}
            >
              <ExternalLink size={16} />
              Open GitHub
            </a>
          </>
        }
      />

      <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void markContributionStatus({
                  status: "Working",
                  eventType: "started_contributing",
                });
              }}
            >
              Mark as contributing
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void markContributionStatus({
                  status: "Pull request sent",
                  eventType: "sent_pull_request",
                });
              }}
            >
              Mark PR sent
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void markContributionStatus({
                  status: "Contributed",
                  eventType: "marked_contributed",
                });
              }}
            >
              Mark as contributed
            </Button>
            <Button type="button" variant="ghost" onClick={shareProject}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </AnimatedSection>

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
              Issues ranked for contribution fit from the dotti.work API.
            </p>
          </div>
        </div>
        {isIssuesLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonProjectCard key={index} />
            ))}
          </div>
        ) : issuesError ? (
          <EmptyState
            title="Could not load issues"
            description={issuesError}
            action={
              <Button
                type="button"
                onClick={() => {
                  void loadIssues();
                }}
              >
                Retry issues
              </Button>
            }
          />
        ) : project.issues.length === 0 ? (
          <EmptyState
            title="No recommended issues"
            description="The API did not return open issues for this repository yet."
          />
        ) : (
          <div className="grid gap-4">
            {project.issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                repositoryId={project.id}
                repositoryName={repositoryName}
                onOpenGitHub={() => {
                  void registerOpenedGithub();
                }}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
