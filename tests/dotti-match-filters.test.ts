import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_FILTERS } from "../data/constants";
import { matchFiltersToApiParams } from "../services/dotti/matchFilters";
import type { TechnologyFilter } from "../types";

test("matchFiltersToApiParams maps visual filters to GET /matches query params", () => {
  const filters: TechnologyFilter = {
    query: "  react dashboard  ",
    technologies: ["React", "TypeScript"],
    difficulty: "Beginner",
    projectSize: "Large",
    activity: "Very active",
    hasGoodFirstIssue: true,
    hasHelpWanted: true,
    minimumStars: 5000,
    language: "TypeScript",
    healthScore: 75,
    sortBy: "Most beginner friendly",
  };

  assert.deepEqual(matchFiltersToApiParams(filters), {
    q: "react dashboard",
    technology: "React",
    language: "TypeScript",
    difficulty: "beginner",
    project_size: "large",
    activity: "very_active",
    has_good_first_issue: true,
    has_help_wanted: true,
    minimum_health_score: 75,
    sort_by: "beginner_friendly",
    limit: 50,
  });
});

test("matchFiltersToApiParams omits unsupported or empty filters", () => {
  assert.deepEqual(matchFiltersToApiParams(DEFAULT_FILTERS), {
    q: undefined,
    technology: undefined,
    language: undefined,
    difficulty: undefined,
    project_size: undefined,
    activity: undefined,
    has_good_first_issue: undefined,
    has_help_wanted: undefined,
    minimum_health_score: undefined,
    sort_by: "best_match",
    limit: 50,
  });
});

test("matchFiltersToApiParams maps sort and enum variants", () => {
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, difficulty: "Easy" }).difficulty,
    "easy",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, difficulty: "Medium" }).difficulty,
    "medium",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, difficulty: "Hard" }).difficulty,
    "hard",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, projectSize: "Small" })
      .project_size,
    "small",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, activity: "High" }).activity,
    "active",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, sortBy: "Most active" })
      .sort_by,
    "most_active",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, sortBy: "Most stars" })
      .sort_by,
    "most_stars",
  );
  assert.equal(
    matchFiltersToApiParams({ ...DEFAULT_FILTERS, sortBy: "Recently updated" })
      .sort_by,
    "recently_updated",
  );
});
