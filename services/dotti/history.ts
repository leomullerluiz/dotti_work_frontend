import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiActivityEventType,
  ApiHistoryEvent,
  ApiPaginatedResponse,
} from "./types";

export type ListHistoryParams = {
  event_type?: ApiActivityEventType;
  github_repository_id?: number;
  limit?: number;
  cursor?: string | number;
};

export function listHistory(params: ListHistoryParams = {}) {
  return dottiRequest<ApiPaginatedResponse<ApiHistoryEvent>>(
    `/me/history${buildQueryString(params)}`,
  );
}

export function clearHistory() {
  return dottiRequest<{ deleted: number }>("/me/history", {
    method: "DELETE",
  });
}
