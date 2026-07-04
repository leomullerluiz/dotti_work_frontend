import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiPaginatedResponse,
  ApiRepositoryStateValue,
  ApiUserRepositoryState,
} from "./types";

export type ListUserRepositoriesParams = {
  state?: ApiRepositoryStateValue;
  limit?: number;
  cursor?: string | number;
};

export type SetRepositoryStateInput = {
  state: ApiRepositoryStateValue;
  notes?: string | null;
};

export function listUserRepositories(params: ListUserRepositoriesParams = {}) {
  return dottiRequest<ApiPaginatedResponse<ApiUserRepositoryState>>(
    `/me/repositories${buildQueryString(params)}`,
  );
}

export async function setRepositoryState(
  githubRepositoryId: number | string,
  input: SetRepositoryStateInput,
) {
  const response = await dottiRequest<{ state: ApiUserRepositoryState }>(
    `/me/repositories/${encodeURIComponent(String(githubRepositoryId))}/state`,
    {
      method: "PUT",
      body: input,
    },
  );

  return response.state;
}

export function deleteRepositoryState(githubRepositoryId: number | string) {
  return dottiRequest<{ removed: boolean }>(
    `/me/repositories/${encodeURIComponent(String(githubRepositoryId))}/state`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreRepository(githubRepositoryId: number | string) {
  const response = await dottiRequest<{ state: ApiUserRepositoryState }>(
    `/me/repositories/${encodeURIComponent(String(githubRepositoryId))}/restore`,
    {
      method: "POST",
    },
  );

  return response.state;
}
