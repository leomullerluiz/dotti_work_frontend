import { dottiRequest } from "./client";
import type {
  ApiPublicProfilePreview,
  ApiPublicProfileSettings,
  ApiPublicUserProfileData,
} from "./types";

export function getPublicUserProfile(login: string) {
  return dottiRequest<ApiPublicUserProfileData>(
    `/public/profiles/${encodeURIComponent(login)}`,
    {
      credentials: "omit",
    },
  );
}

export function getMyPublicProfilePreview() {
  return dottiRequest<ApiPublicProfilePreview>("/me/public-profile");
}

export function updatePublicProfileSettings(isPublic: boolean) {
  return dottiRequest<ApiPublicProfileSettings>("/me/public-profile/settings", {
    method: "PUT",
    body: {
      is_public: isPublic,
    },
  });
}
