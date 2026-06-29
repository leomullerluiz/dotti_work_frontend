"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedArticle } from "@/components/ui/AnimatedSurface";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PROJECT_STATUSES } from "@/data/constants";
import { mockProjects } from "@/data/repositories";
import { useHistory } from "@/hooks/useHistory";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import type { ProjectStatus } from "@/types";
import { formatDate } from "@/utils/format";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { RepositoryAvatar } from "./RepositoryAvatar";

type Tab = "All" | ProjectStatus;

export function SavedProjectsPage() {
  const { savedProjects, removeProject, updateStatus } = useSavedProjects();
  const { addHistory } = useHistory();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const projects = savedProjects
    .map((saved) => ({
      saved,
      project: mockProjects.find((project) => project.id === saved.repositoryId),
    }))
    .filter((item) => item.project)
    .filter((item) => activeTab === "All" || item.saved.status === activeTab);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Saved"
        title="Saved projects"
        description="Track repositories you want to research, contribute to, or archive later."
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["All", ...PROJECT_STATUSES] as Tab[]).map((tab) => (
          <AnimateButton
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? "whitespace-nowrap rounded-full border border-coral-400 bg-coral-400/10 px-3 py-1.5 text-xs font-medium text-coral-700 dark:text-coral-200"
                : "whitespace-nowrap rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-coral-300 hover:text-coral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
            }
          >
            {tab}
          </AnimateButton>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No saved projects here"
          description="Save repositories from Matches to build your contribution shortlist."
          action={
            <Link href="/matches" className={buttonClasses()}>
              Explore matches
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {projects.map(({ saved, project }) => {
            if (!project) {
              return null;
            }
            const repositoryName = `${project.owner}/${project.repo}`;
            return (
              <AnimatedArticle
                key={saved.repositoryId}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <RepositoryAvatar
                      owner={project.owner}
                      repo={project.repo}
                      color={project.avatarColor}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/projects/${project.owner}/${project.repo}`}
                          className="font-semibold text-zinc-950 hover:text-coral-600 dark:text-white"
                        >
                          {repositoryName}
                        </Link>
                        <MatchScoreBadge score={project.matchScore} />
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {project.description}
                      </p>
                      <p className="mt-3 text-xs text-zinc-500">
                        Saved {formatDate(saved.savedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ProjectStatusSelect
                      value={saved.status}
                      onChange={(status) => updateStatus(saved.repositoryId, status)}
                    />
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        addHistory({
                          type: "Opened GitHub",
                          repositoryId: project.id,
                          repositoryName,
                        })
                      }
                      className={buttonClasses({ variant: "outline", size: "sm" })}
                    >
                      <ExternalLink size={15} />
                      GitHub
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(saved.repositoryId)}
                    >
                      <Trash2 size={15} />
                      Remove
                    </Button>
                  </div>
                </div>
              </AnimatedArticle>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
