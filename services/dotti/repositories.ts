import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiHistoryEvent,
  ApiPaginatedResponse,
  ApiRepositoryActivityEventType,
  ApiRepositoryDetail,
  ApiRepositoryIssue,
} from "./types";

export type ListRepositoryIssuesParams = {
  difficulty?: "beginner" | "intermediate" | "advanced";
  label?: string;
  limit?: number;
  cursor?: string | number;
};

export type RegisterRepositoryActivityInput = {
  event_type: ApiRepositoryActivityEventType;
};

function repositoryPath(owner: string, repo: string) {
  return `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function getRepository(owner: string, repo: string) {
  return dottiRequest<ApiRepositoryDetail>(repositoryPath(owner, repo));
}

export function listRepositoryIssues(
  owner: string,
  repo: string,
  params: ListRepositoryIssuesParams = {},
) {
  return dottiRequest<ApiPaginatedResponse<ApiRepositoryIssue>>(
    `${repositoryPath(owner, repo)}/issues${buildQueryString(params)}`,
  );
}

export async function registerRepositoryActivity(
  owner: string,
  repo: string,
  input: RegisterRepositoryActivityInput,
) {
  const response = await dottiRequest<{ event: ApiHistoryEvent }>(
    `${repositoryPath(owner, repo)}/activity`,
    {
      method: "POST",
      body: input,
    },
  );

  return response.event;
}
