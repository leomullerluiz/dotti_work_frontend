import { Award } from "lucide-react";
import { cn } from "@/utils/cn";

const badgeLevelClasses: Record<string, string> = {
  bronze:
    "border-orange-300 bg-orange-500/10 text-orange-700 dark:border-orange-400/30 dark:text-orange-200",
  silver:
    "border-zinc-300 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/30 dark:text-zinc-200",
  gold:
    "border-amber-300 bg-amber-400/15 text-amber-700 dark:border-amber-300/30 dark:text-amber-200",
  platinum:
    "border-sky-300 bg-sky-400/10 text-sky-700 dark:border-sky-300/30 dark:text-sky-200",
  diamond:
    "border-cyan-300 bg-cyan-400/10 text-cyan-700 dark:border-cyan-300/30 dark:text-cyan-200",
  emerald:
    "border-emerald-300 bg-emerald-400/10 text-emerald-700 dark:border-emerald-300/30 dark:text-emerald-200",
  ruby:
    "border-rose-300 bg-rose-400/10 text-rose-700 dark:border-rose-300/30 dark:text-rose-200",
  legendary:
    "border-violet-300 bg-violet-400/10 text-violet-700 dark:border-violet-300/30 dark:text-violet-200",
};

function badgeLevelClass(level?: string | null) {
  const key = level?.trim().toLowerCase();

  return key && badgeLevelClasses[key]
    ? badgeLevelClasses[key]
    : "border-coral-300 bg-coral-500/10 text-coral-600 dark:border-coral-400/30 dark:text-coral-200";
}

export function BadgeImage({
  level,
  className,
}: {
  level?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-lg border",
        badgeLevelClass(level),
        className,
      )}
    >
      <Award size={24} aria-hidden="true" />
    </div>
  );
}
