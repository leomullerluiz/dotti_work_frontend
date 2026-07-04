import type { DottiUser } from "./auth";
import { dottiRequest } from "./client";
import type { ApiGitHubIntegrationStatus } from "./types";

export type GitHubIntegrationStatusResponse = {
  github: ApiGitHubIntegrationStatus;
};

export type SyncGitHubIntegrationResponse = {
  user: DottiUser;
};

export async function getGitHubIntegrationStatus() {
  const response =
    await dottiRequest<GitHubIntegrationStatusResponse>(
      "/integrations/github/status",
    );

  return response.github;
}

export function syncGitHubIntegration() {
  return dottiRequest<SyncGitHubIntegrationResponse>(
    "/integrations/github/sync",
    {
      method: "POST",
    },
  );
}

export function disconnectGitHubIntegration() {
  return dottiRequest<{ connected: boolean }>("/integrations/github", {
    method: "DELETE",
  });
}
