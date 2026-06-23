import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { MatchedProject } from "@/types";
import { MatchScoreBadge } from "./MatchScoreBadge";

export function ContributionReadinessCard({
  project,
}: {
  project: MatchedProject;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-coral-500" />
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Compatibility
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            You overlap with {project.sharedTechnologies.join(", ")}. This repository
            uses {project.languages.join(", ")} and is recommended for{" "}
            {project.recommendedLevel} contributors.
          </p>
        </div>
        <div className="rounded-xl border border-coral-400/20 bg-coral-400/10 p-4 text-center">
          <div className="text-4xl font-semibold text-coral-500">
            {project.matchScore}%
          </div>
          <MatchScoreBadge score={project.matchScore} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Positive signals
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {project.positives.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
            <AlertCircle size={16} className="text-amber-500" />
            Possible challenges
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {project.challenges.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
