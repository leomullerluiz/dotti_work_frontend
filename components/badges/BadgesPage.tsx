"use client";

import { useMemo } from "react";
import { Award, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { StatCard } from "@/components/ui/StatCard";
import { useBadges } from "@/hooks/useBadges";
import type { ApiBadge } from "@/services/dotti/types";
import { BadgeCard } from "./BadgeCard";
import { BadgeProgressCard } from "./BadgeProgressCard";

const categoryLabels: Record<string, string> = {
  setup: "Setup",
  discovery: "Discovery",
  contribution: "Contribution",
  quality: "Quality",
  consistency: "Consistency",
  special: "Special",
};

function categoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}

export function BadgesPage() {
  const {
    catalog,
    earned,
    progress,
    isLoading,
    error,
    refreshBadges,
  } = useBadges();

  const earnedBySlug = useMemo(
    () => new Map(earned.map((item) => [item.slug, item])),
    [earned],
  );
  const progressBySlug = useMemo(
    () => new Map(progress.map((item) => [item.slug, item])),
    [progress],
  );
  const badges = useMemo(() => {
    const bySlug = new Map<string, ApiBadge>();

    for (const badge of catalog) {
      bySlug.set(badge.slug, badge);
    }

    for (const item of earned) {
      bySlug.set(item.badge.slug, item.badge);
    }

    for (const item of progress) {
      bySlug.set(item.badge.slug, item.badge);
    }

    return [...bySlug.values()].sort(
      (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name),
    );
  }, [catalog, earned, progress]);
  const groupedBadges = useMemo(
    () =>
      badges.reduce<Record<string, ApiBadge[]>>((acc, badge) => {
        acc[badge.category] = [...(acc[badge.category] ?? []), badge];
        return acc;
      }, {}),
    [badges],
  );
  const nextProgress = progress
    .filter((item) => !item.completed)
    .sort((a, b) => b.percent - a.percent)[0];

  if (isLoading && badges.length === 0) {
    return (
      <AppShell>
        <SkeletonProjectCard />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonProjectCard key={index} />
          ))}
        </div>
      </AppShell>
    );
  }

  if (error && badges.length === 0) {
    return (
      <AppShell>
        <EmptyState
          title="Could not load achievements"
          description={error}
          action={
            <Button
              type="button"
              onClick={() => {
                void refreshBadges();
              }}
            >
              Retry
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Achievements"
        title="Your open source milestones"
        description="Track earned badges and nearby progress from the API."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refreshBadges();
            }}
            disabled={isLoading}
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Unlocked"
          value={earned.length}
          helper={`${badges.length} known achievements`}
          icon={<Award size={18} />}
        />
        <StatCard
          label="In progress"
          value={progress.filter((item) => !item.completed).length}
          helper={nextProgress ? `${nextProgress.badge.name} is closest` : "No active progress"}
        />
      </div>

      {badges.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No achievements yet"
            description="Complete your profile and explore projects to unlock achievements."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
            <AnimatedSection
              key={category}
              className="py-2"
            >
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                {categoryLabel(category)}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryBadges.map((badge) => {
                  const earnedBadge = earnedBySlug.get(badge.slug);
                  const badgeProgress = progressBySlug.get(badge.slug);

                  return (
                    <BadgeCard
                      key={badge.slug}
                      badge={badge}
                      earnedAt={earnedBadge?.awarded_at}
                      progress={badgeProgress}
                      locked={!earnedBadge && !badgeProgress}
                    />
                  );
                })}
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </AppShell>
  );
}
