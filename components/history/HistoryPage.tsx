"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedArticle } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import type { HistoryEvent } from "@/types";
import { formatDate } from "@/utils/format";

const filters = [
  "All",
  "Viewed",
  "Saved",
  "Ignored",
  "Opened GitHub",
  "Contributions",
] as const;

type HistoryFilter = (typeof filters)[number];

export function HistoryPage() {
  const { history, isLoading, error, retryHistory, clearHistory } = useHistory();
  const { ignoredProjectIds, undoIgnore } = useMatches();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("All");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const events = useMemo(
    () => history.filter((event) => matchesFilter(event, activeFilter)),
    [activeFilter, history],
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="History"
        title="Interaction history"
        description="A timeline of viewed, saved, ignored, and GitHub-opened projects from your dotti.work account."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            disabled={history.length === 0}
          >
            <Trash2 size={16} />
            Clear history
          </Button>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <AnimateButton
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={
              activeFilter === filter
                ? "whitespace-nowrap rounded-full border border-coral-400 bg-coral-400/10 px-3 py-1.5 text-xs font-medium text-coral-700 dark:text-coral-200"
                : "whitespace-nowrap rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-coral-300 hover:text-coral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
            }
          >
            {filter}
          </AnimateButton>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonProjectCard key={index} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load history"
          description={error}
          action={
            <Button
              type="button"
              onClick={() => {
                void retryHistory();
              }}
            >
              Retry
            </Button>
          }
        />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events in this view"
          description="Interactions will appear here as you browse matches, save projects, ignore suggestions, or open GitHub links."
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const canUndoIgnore =
              event.type === "Ignored project" &&
              event.repositoryId &&
              ignoredProjectIds.includes(event.repositoryId);

            return (
              <AnimatedArticle
                key={event.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={toneForEvent(event.type)}>{event.type}</Badge>
                      {event.repositoryName ? (
                        <span className="font-medium text-zinc-950 dark:text-white">
                          {event.repositoryName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                  {canUndoIgnore ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void undoIgnore(event.repositoryId as string);
                      }}
                    >
                      <RotateCcw size={15} />
                      Undo ignore
                    </Button>
                  ) : null}
                </div>
              </AnimatedArticle>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Clear interaction history?"
        description="This removes your API history, but it does not clear saved projects or ignored projects."
        confirmLabel="Clear history"
        onConfirm={() => {
          void clearHistory();
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}

function matchesFilter(event: HistoryEvent, filter: HistoryFilter) {
  if (filter === "All") {
    return true;
  }

  if (filter === "Contributions") {
    return (
      event.type === "Marked as contributing" ||
      event.type === "Marked as contributed"
    );
  }

  return event.type.startsWith(filter);
}

function toneForEvent(type: HistoryEvent["type"]) {
  if (type.includes("Saved") || type.includes("contributed")) {
    return "success" as const;
  }
  if (type.includes("Ignored")) {
    return "warning" as const;
  }
  if (type.includes("GitHub")) {
    return "blue" as const;
  }
  return "neutral" as const;
}
