"use client";

import { Badge as UiBadge } from "@/components/ui/Badge";
import { AnimatedArticle } from "@/components/ui/AnimatedSurface";
import type { ApiBadge, ApiBadgeProgress } from "@/services/dotti/types";
import { BadgeImage } from "./BadgeImage";

function formatAwardDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export function BadgeCard({
  badge,
  earnedAt,
  progress,
  locked,
}: {
  badge: ApiBadge;
  earnedAt?: string | null;
  progress?: ApiBadgeProgress;
  locked?: boolean;
}) {
  const earned = Boolean(earnedAt || progress?.completed);
  const secret = badge.is_secret && !earned;
  const awardDate = formatAwardDate(earnedAt ?? progress?.awarded_at);
  const progressPercent = Math.max(0, Math.min(100, progress?.percent ?? 0));

  return (
    <AnimatedArticle className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex gap-4">
        <BadgeImage
          level={badge.level}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              {secret ? "Secret achievement" : badge.name}
            </h3>
            <UiBadge tone={earned ? "success" : locked ? "neutral" : "accent"}>
              {earned ? "Earned" : badge.level}
            </UiBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {secret
              ? "Keep contributing to reveal this achievement."
              : badge.description}
          </p>
          {awardDate ? (
            <p className="mt-3 text-xs text-zinc-500">Earned on {awardDate}</p>
          ) : null}
        </div>
      </div>

      {!earned && progress ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Progress</span>
            <span>
              {progress.current_value}/{progress.target_value}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-coral-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </AnimatedArticle>
  );
}
