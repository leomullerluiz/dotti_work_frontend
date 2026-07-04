import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiPaginatedResponse,
  ApiRepositoryMatchItem,
  ApiRepositoryStateValue,
  ApiSortBy,
} from "./types";

export type ListMatchesParams = {
  q?: string;
  state?: ApiRepositoryStateValue;
  minimum_score?: number;
  technology?: string | string[];
  language?: string;
  difficulty?:
    | "easy"
    | "medium"
    | "hard"
    | "unknown"
    | "beginner"
    | "intermediate"
    | "advanced";
  project_size?: "small" | "medium" | "large";
  activity?: "low" | "moderate" | "active" | "very_active";
  has_good_first_issue?: boolean;
  has_help_wanted?: boolean;
  minimum_health_score?: number;
  sort_by?: ApiSortBy;
  limit?: number;
  cursor?: string | number;
};

export type ListMatchesResponse = ApiPaginatedResponse<ApiRepositoryMatchItem> & {
  metadata?: {
    cached?: boolean;
  };
};

export type RefreshMatchesResponse = {
  refreshed: boolean;
  items: ApiRepositoryMatchItem[];
};

export function listMatches(params: ListMatchesParams = {}) {
  return dottiRequest<ListMatchesResponse>(
    `/matches${buildQueryString(params)}`,
  );
}

export function refreshMatches() {
  return dottiRequest<RefreshMatchesResponse>("/matches/refresh", {
    method: "POST",
  });
}

export function getMatch(githubRepositoryId: number | string) {
  return dottiRequest<ApiRepositoryMatchItem>(
    `/matches/${encodeURIComponent(String(githubRepositoryId))}`,
  );
}
