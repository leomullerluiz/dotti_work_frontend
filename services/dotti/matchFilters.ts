import type { TechnologyFilter } from "@/types";
import type { ListMatchesParams } from "./matches";

export function matchFiltersToApiParams(
  filters: TechnologyFilter,
): ListMatchesParams {
  return {
    q: trimmedOrUndefined(filters.query),
    technology: filters.technologies[0],
    language: filters.language === "All" ? undefined : filters.language,
    difficulty: mapDifficulty(filters.difficulty),
    project_size: mapProjectSize(filters.projectSize),
    activity: mapActivity(filters.activity),
    has_good_first_issue: filters.hasGoodFirstIssue || undefined,
    has_help_wanted: filters.hasHelpWanted || undefined,
    minimum_health_score:
      filters.healthScore > 0 ? filters.healthScore : undefined,
    sort_by: mapSortBy(filters.sortBy),
    limit: 50,
  };
}

function trimmedOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function mapDifficulty(value: TechnologyFilter["difficulty"]) {
  switch (value) {
    case "Beginner":
      return "beginner" as const;
    case "Easy":
      return "easy" as const;
    case "Medium":
      return "medium" as const;
    case "Hard":
      return "hard" as const;
    case "All":
    default:
      return undefined;
  }
}

function mapProjectSize(value: TechnologyFilter["projectSize"]) {
  switch (value) {
    case "Small":
      return "small" as const;
    case "Medium":
      return "medium" as const;
    case "Large":
      return "large" as const;
    case "All":
    case "Any":
    default:
      return undefined;
  }
}

function mapActivity(value: TechnologyFilter["activity"]) {
  switch (value) {
    case "Low":
      return "low" as const;
    case "Moderate":
      return "moderate" as const;
    case "High":
      return "active" as const;
    case "Very active":
      return "very_active" as const;
    case "All":
    default:
      return undefined;
  }
}

function mapSortBy(value: TechnologyFilter["sortBy"]) {
  switch (value) {
    case "Most active":
      return "most_active" as const;
    case "Most stars":
      return "most_stars" as const;
    case "Most beginner friendly":
      return "beginner_friendly" as const;
    case "Recently updated":
      return "recently_updated" as const;
    case "Best match":
    default:
      return "best_match" as const;
  }
}
