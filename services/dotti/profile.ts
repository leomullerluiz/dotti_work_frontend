import { dottiRequest } from "./client";
import { buildQueryString } from "./query";
import type {
  ApiPaginatedResponse,
  ApiProfileUpdateInput,
  ApiTechnology,
  ApiTechnologyCategory,
  ApiUser,
  ApiUserPreference,
  ApiUserPreferenceInput,
  ApiUserProfile,
  ApiUserTechnology,
  ApiUserTechnologyInput,
} from "./types";

export type ProfileResponse = {
  user: ApiUser;
  profile: ApiUserProfile;
};

export type ListTechnologiesParams = {
  category?: ApiTechnologyCategory;
  q?: string;
  active?: boolean;
  limit?: number;
  cursor?: string | number;
};

export function getMyProfile() {
  return dottiRequest<ProfileResponse>("/me/profile");
}

export function updateMyProfile(input: ApiProfileUpdateInput) {
  return dottiRequest<ProfileResponse>("/me/profile", {
    method: "PUT",
    body: input,
  });
}

export async function getMyTechnologies() {
  const response = await dottiRequest<{ technologies: ApiUserTechnology[] }>(
    "/me/technologies",
  );

  return response.technologies;
}

export async function replaceMyTechnologies(
  technologies: ApiUserTechnologyInput[],
) {
  const response = await dottiRequest<{ technologies: ApiUserTechnology[] }>(
    "/me/technologies",
    {
      method: "PUT",
      body: { technologies },
    },
  );

  return response.technologies;
}

export async function getMyPreferences() {
  const response = await dottiRequest<{ preferences: ApiUserPreference }>(
    "/me/preferences",
  );

  return response.preferences;
}

export async function updateMyPreferences(input: ApiUserPreferenceInput) {
  const response = await dottiRequest<{ preferences: ApiUserPreference }>(
    "/me/preferences",
    {
      method: "PUT",
      body: input,
    },
  );

  return response.preferences;
}

export function listTechnologies(params: ListTechnologiesParams = {}) {
  return dottiRequest<ApiPaginatedResponse<ApiTechnology>>(
    `/catalog/technologies${buildQueryString(params)}`,
  );
}
