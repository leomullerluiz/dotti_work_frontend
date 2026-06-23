"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  DEFAULT_FILTERS,
  DIFFICULTY_LEVELS,
  SORT_OPTIONS,
} from "@/data/constants";
import { mockProjects } from "@/data/repositories";
import { useMatches } from "@/hooks/useMatches";
import type { ActivityLevel, DifficultyLevel, ProjectSize } from "@/types";
import { SearchInput } from "../ui/SearchInput";

const projectSizes: Array<"All" | ProjectSize> = ["All", "Small", "Medium", "Large"];
const activities: Array<"All" | ActivityLevel> = ["All", ...ACTIVITY_LEVELS];
const difficulties: Array<"All" | DifficultyLevel> = ["All", ...DIFFICULTY_LEVELS];
const languages = Array.from(
  new Set(mockProjects.flatMap((project) => project.languages)),
).sort();

export function ProjectFilters() {
  const { filters, setFilters, resetFilters } = useMatches();

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-coral-500" />
          <h2 className="font-semibold text-zinc-950 dark:text-white">Filters</h2>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-medium text-coral-600 hover:text-coral-500 dark:text-coral-300"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-5">
        <SearchInput
          value={filters.query}
          onChange={(query) => setFilters({ ...filters, query })}
          placeholder="Search repositories"
        />

        <FilterGroup label="Technologies">
          <div className="flex flex-wrap gap-2">
            {languages.slice(0, 12).map((language) => {
              const selected = filters.technologies.includes(language);
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      technologies: selected
                        ? filters.technologies.filter((item) => item !== language)
                        : [...filters.technologies, language],
                    })
                  }
                  className={
                    selected
                      ? "rounded-full border border-coral-400 bg-coral-400/10 px-3 py-1 text-xs font-medium text-coral-700 dark:text-coral-200"
                      : "rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-coral-300 hover:text-coral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
                  }
                >
                  {language}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup label="Difficulty">
          <Select
            value={filters.difficulty}
            onChange={(difficulty) =>
              setFilters({ ...filters, difficulty: difficulty as "All" | DifficultyLevel })
            }
            options={difficulties}
          />
        </FilterGroup>

        <FilterGroup label="Project size">
          <Select
            value={filters.projectSize}
            onChange={(projectSize) =>
              setFilters({ ...filters, projectSize: projectSize as "All" | ProjectSize })
            }
            options={projectSizes}
          />
        </FilterGroup>

        <FilterGroup label="Activity">
          <Select
            value={filters.activity}
            onChange={(activity) =>
              setFilters({ ...filters, activity: activity as "All" | ActivityLevel })
            }
            options={activities}
          />
        </FilterGroup>

        <FilterGroup label="Language">
          <Select
            value={filters.language}
            onChange={(language) => setFilters({ ...filters, language })}
            options={["All", ...languages]}
          />
        </FilterGroup>

        <FilterGroup label="Minimum stars">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={15000}
              step={1000}
              value={filters.minimumStars}
              onChange={(event) =>
                setFilters({ ...filters, minimumStars: Number(event.target.value) })
              }
              className="w-full accent-coral-500"
            />
            <span className="w-12 text-right text-xs text-zinc-500">
              {filters.minimumStars}
            </span>
          </div>
        </FilterGroup>

        <FilterGroup label="Repository health">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.healthScore}
              onChange={(event) =>
                setFilters({ ...filters, healthScore: Number(event.target.value) })
              }
              className="w-full accent-coral-500"
            />
            <span className="w-10 text-right text-xs text-zinc-500">
              {filters.healthScore}%
            </span>
          </div>
        </FilterGroup>

        <label className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={filters.hasGoodFirstIssue}
            onChange={(event) =>
              setFilters({ ...filters, hasGoodFirstIssue: event.target.checked })
            }
            className="size-4 rounded accent-coral-500"
          />
          Has good first issue
        </label>

        <label className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={filters.hasHelpWanted}
            onChange={(event) =>
              setFilters({ ...filters, hasHelpWanted: event.target.checked })
            }
            className="size-4 rounded accent-coral-500"
          />
          Has help wanted
        </label>

        <FilterGroup label="Sort by">
          <Select
            value={filters.sortBy}
            onChange={(sortBy) =>
              setFilters({
                ...filters,
                sortBy: SORT_OPTIONS.includes(sortBy as (typeof SORT_OPTIONS)[number])
                  ? (sortBy as (typeof SORT_OPTIONS)[number])
                  : DEFAULT_FILTERS.sortBy,
              })
            }
            options={SORT_OPTIONS}
          />
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
