"use client";

import Link from "next/link";
import { BarChart3, Filter, RefreshCcw, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDetails, AnimatedDiv } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { useMatches } from "@/hooks/useMatches";
import { useProfile } from "@/hooks/useProfile";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGrid } from "./ProjectGrid";

export function MatchesPage() {
  const {
    projects,
    filters,
    isLoading,
    isRefreshing,
    error,
    refreshMatches,
    retryMatches,
    ignoredProjectIds,
  } = useMatches();
  const { profile } = useProfile();
  const canRefresh = !isLoading && !isRefreshing;

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
        description={`${projects.length} repositories match your current filters and API-backed preferences.`}
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

      <div className="grid gap-5 lg:grid-cols-[280px_1fr_300px]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <AnimatedDetails className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] lg:hidden">
            <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-950 dark:text-white">
              <Filter size={17} />
              Filters
            </summary>
            <div className="mt-4">
              <ProjectFilters />
            </div>
          </AnimatedDetails>
          <div className="hidden lg:block">
            <ProjectFilters />
          </div>
        </div>

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
          <StatCard
            label="Best match"
            value={projects[0] ? `${projects[0].matchScore}%` : "0%"}
            helper={projects[0] ? `${projects[0].owner}/${projects[0].repo}` : "No result"}
            icon={<BarChart3 size={18} />}
          />
          <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-semibold text-zinc-950 dark:text-white">
              Profile insights
            </h2>
            {profile ? (
              <>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Recommendations are tuned for a {profile.seniority}{" "}
                  {profile.role.toLowerCase()} focused on {profile.goal.toLowerCase()}.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.technologies.slice(0, 6).map((technology) => (
                    <Badge key={technology.name} tone="accent">
                      {technology.name}
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Complete onboarding to personalize the API matching experience.
              </p>
            )}
          </AnimatedDiv>
          <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-semibold text-zinc-950 dark:text-white">
              Active filters
            </h2>
            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Sort: {filters.sortBy}</p>
              <p>Min stars: {filters.minimumStars}</p>
              <p>Health: {filters.healthScore}%+</p>
              <p>Ignored: {ignoredProjectIds.length}</p>
            </div>
          </AnimatedDiv>
        </aside>
      </div>
    </AppShell>
  );
}
