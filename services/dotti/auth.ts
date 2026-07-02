import { dottiRequest, isUnauthorizedError } from "./client";

export type DottiUser = {
  id: number;
  login: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website_url: string | null;
  github_profile_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type DottiAuthProfile = {
  role: string | null;
  seniority: "junior" | "mid" | "senior" | null;
  onboarding_completed: boolean;
  goals: string[];
};

export type DottiGitHubIntegration = {
  connected: boolean;
  login: string | null;
  provider: "github";
  scope: string | null;
  token_last_verified_at: string | null;
};

export type AuthMeData = {
  user: DottiUser;
  profile: DottiAuthProfile;
  github: DottiGitHubIntegration;
};

export function getAuthenticatedUser() {
  return dottiRequest<AuthMeData>("/auth/me");
}

export async function getOptionalAuthenticatedUser() {
  try {
    return await getAuthenticatedUser();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}

export function logoutCurrentSession() {
  return dottiRequest<{ logged_out: boolean }>("/auth/logout", {
    method: "POST",
  });
}
