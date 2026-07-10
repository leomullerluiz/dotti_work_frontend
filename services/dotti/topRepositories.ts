import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiPaginatedResponse,
  ApiTopRepositoryItem,
  ApiTopRepositoryListMetadata,
  ApiTopRepositorySortBy,
} from "./types";

export type ListTopRepositoriesParams = {
  sort_by?: ApiTopRepositorySortBy;
  technology?: string;
  limit?: number;
  cursor?: string | number;
};

export type ListTopRepositoriesResponse =
  ApiPaginatedResponse<ApiTopRepositoryItem> & {
    metadata?: ApiTopRepositoryListMetadata;
  };

export function listTopRepositories(params: ListTopRepositoriesParams = {}) {
  return dottiRequest<ListTopRepositoriesResponse>(
    `/repositories/top${buildQueryString(params)}`,
  );
}
