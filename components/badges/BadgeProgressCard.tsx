"use client";

import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import type { ApiBadgeProgress, ApiUserBadge } from "@/services/dotti/types";
import { BadgeImage } from "./BadgeImage";

export function BadgeProgressCard({
  earned,
  progress,
  totalBadges,
  isLoading,
  error,
  onRetry,
}: {
  earned: ApiUserBadge[];
  progress: ApiBadgeProgress[];
  totalBadges?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="h-4 w-28 rounded bg-zinc-100 dark:bg-white/10" />
        <div className="mt-4 h-8 rounded bg-zinc-100 dark:bg-white/10" />
        <div className="mt-4 h-2 rounded bg-zinc-100 dark:bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="font-semibold text-zinc-950 dark:text-white">Achievements</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Could not load achievements now.
        </p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  const nextProgress = progress
    .filter((item) => !item.completed)
    .sort((a, b) => b.percent - a.percent)[0];
  const lastEarned = [...earned].sort(
    (a, b) =>
      new Date(b.awarded_at.replace(" ", "T")).getTime() -
      new Date(a.awarded_at.replace(" ", "T")).getTime(),
  )[0];
  const totalKnown = new Set([
    ...earned.map((item) => item.slug),
    ...progress.map((item) => item.slug),
  ]).size;
  const totalAchievements = Math.max(totalKnown, totalBadges ?? 0);
  const unlockedLabel =
    totalAchievements > 0
      ? `${earned.length} of ${totalAchievements} unlocked`
      : "No achievements yet";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Achievements</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
            {unlockedLabel}
          </h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
          <Award size={18} />
        </div>
      </div>

      {nextProgress ? (
        <div className="mt-5 flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20">
          <BadgeImage
            imageUrl={nextProgress.badge.image_url}
            imageAlt={nextProgress.badge.image_alt}
            icon={nextProgress.badge.icon}
            level={nextProgress.badge.level}
            earned={false}
            secret={nextProgress.badge.is_secret}
            className="size-12"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-950 dark:text-white">
              Next: {nextProgress.badge.is_secret ? "Secret achievement" : nextProgress.badge.name}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {nextProgress.current_value}/{nextProgress.target_value} completed
            </p>
            <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-coral-500"
                style={{ width: `${Math.max(0, Math.min(100, nextProgress.percent))}%` }}
              />
            </div>
          </div>
        </div>
      ) : lastEarned ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Latest: {lastEarned.badge.name}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Complete your profile and explore projects to unlock achievements.
        </p>
      )}

      <Link href="/badges" className={buttonClasses({ variant: "outline", size: "sm", className: "mt-5" })}>
        View achievements
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}
