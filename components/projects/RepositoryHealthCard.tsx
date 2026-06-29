import { CheckCircle2, CircleDashed } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import type { HealthChecklistItem } from "@/types";

export function RepositoryHealthCard({
  healthScore,
  checklist,
}: {
  healthScore: number;
  checklist: HealthChecklistItem[];
}) {
  return (
    <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Repository health
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Signals that make contribution safer.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-coral-500">{healthScore}%</div>
          <p className="text-xs text-zinc-500">health score</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {checklist.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20"
          >
            {item.passed ? (
              <CheckCircle2 size={17} className="text-emerald-500" />
            ) : (
              <CircleDashed size={17} className="text-zinc-400" />
            )}
            <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
