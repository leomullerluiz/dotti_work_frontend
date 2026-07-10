"use client";

import Link from "next/link";
import { BarChart3, Eye, RefreshCcw, UserRound } from "lucide-react";
import { BadgeProgressCard } from "@/components/badges/BadgeProgressCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDiv } from "@/components/ui/AnimatedSurface";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMatches } from "@/hooks/useMatches";
import { useBadges } from "@/hooks/useBadges";
import { projectDetailHref } from "@/utils/projectRoutes";
import { ProjectGrid } from "./ProjectGrid";

export function MatchesPage() {
  const {
    projects,
    isLoading,
    isRefreshing,
    error,
    refreshMatches,
    retryMatches,
  } = useMatches();
  const {
    catalog: badgeCatalog,
    earned: earnedBadges,
    progress: badgeProgress,
    isLoading: badgesLoading,
    error: badgesError,
    refreshBadges,
  } = useBadges();
  const canRefresh = !isLoading && !isRefreshing;
  const bestMatch = projects[0];

  const refreshAndScrollToTop = () => {
    refreshMatches();

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Matches"
        title="Projects matching your profile"
        description={`${projects.length} repositories returned from your API-backed recommendations.`}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={refreshAndScrollToTop}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
              Refresh matches
            </Button>
            <Link href="/profile" className={buttonClasses({ variant: "secondary" })}>
              <UserRound size={16} />
              Edit profile
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {error ? (
            <EmptyState
              title="Could not load matches"
              description={error}
              action={
                <Button type="button" onClick={retryMatches}>
                  Retry
                </Button>
              }
            />
          ) : (
            <>
              <ProjectGrid
                projects={projects}
                isLoading={isLoading || isRefreshing}
                emptyAction={
                  <Button
                    type="button"
                    onClick={refreshAndScrollToTop}
                    disabled={!canRefresh}
                  >
                    <RefreshCcw
                      size={16}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                    Refresh matches
                  </Button>
                }
              />

              {projects.length > 0 && canRefresh ? (
                <AnimatedDiv className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <h2 className="font-semibold text-zinc-950 dark:text-white">
                    Want newer recommendations?
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Refresh matches to ask the API for updated repository suggestions.
                  </p>
                  <Button
                    type="button"
                    className="mt-4"
                    onClick={refreshAndScrollToTop}
                  >
                    <RefreshCcw size={16} />
                    Refresh matches
                  </Button>
                </AnimatedDiv>
              ) : null}
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-coral-500/5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Best match
                </p>
                <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
                  {bestMatch ? `${bestMatch.matchScore}%` : "0%"}
                </div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
                <BarChart3 size={18} />
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
              {bestMatch ? `${bestMatch.owner}/${bestMatch.repo}` : "No result"}
            </p>
            {bestMatch ? (
              <Link
                href={projectDetailHref(bestMatch.owner, bestMatch.repo)}
                className={buttonClasses({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4 w-full",
                })}
              >
                <Eye size={15} />
                View repository
              </Link>
            ) : null}
          </AnimatedDiv>
          <BadgeProgressCard
            earned={earnedBadges}
            progress={badgeProgress}
            totalBadges={badgeCatalog.length}
            isLoading={badgesLoading}
            error={badgesError}
            onRetry={() => {
              void refreshBadges();
            }}
          />
        </aside>
      </div>
    </AppShell>
  );
}
