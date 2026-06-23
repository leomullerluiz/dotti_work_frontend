"use client";

import { ExternalLink, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { useHistory } from "@/hooks/useHistory";
import type { RepositoryIssue } from "@/types";
import { formatDate } from "@/utils/format";
import { DifficultyBadge } from "./DifficultyBadge";
import { MatchScoreBadge } from "./MatchScoreBadge";

export function IssueCard({
  issue,
  repositoryId,
  repositoryName,
}: {
  issue: RepositoryIssue;
  repositoryId: string;
  repositoryName: string;
}) {
  const { addHistory } = useHistory();

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-zinc-950 dark:text-white">{issue.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {issue.labels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
            <DifficultyBadge difficulty={issue.difficulty} />
            <MatchScoreBadge score={issue.matchScore} />
          </div>
        </div>
        <a
          href={issue.url}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            addHistory({
              type: "Opened GitHub",
              repositoryId,
              repositoryName,
              metadata: { issueId: issue.id },
            })
          }
          className={buttonClasses({ variant: "outline", size: "sm" })}
        >
          <ExternalLink size={15} />
          Open on GitHub
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{issue.contributionType}</span>
        <span className="flex items-center gap-1">
          <MessageCircle size={14} />
          {issue.comments} comments
        </span>
        <span>Created {formatDate(issue.createdAt)}</span>
      </div>
    </article>
  );
}
