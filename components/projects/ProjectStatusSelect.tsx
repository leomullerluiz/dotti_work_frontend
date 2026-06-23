"use client";

import { PROJECT_STATUSES } from "@/data/constants";
import type { ProjectStatus } from "@/types";

export function ProjectStatusSelect({
  value,
  onChange,
}: {
  value: ProjectStatus;
  onChange: (status: ProjectStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as ProjectStatus)}
      className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
    >
      {PROJECT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
