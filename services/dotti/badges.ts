import { dottiRequest } from "./client";
import type { ApiBadge, ApiMyBadges, ApiUserBadge } from "./types";

export async function listBadgeCatalog() {
  const response = await dottiRequest<{ badges: ApiBadge[] }>("/badges");

  return response.badges;
}

export function listMyBadges() {
  return dottiRequest<ApiMyBadges>("/me/badges");
}

export type BadgeEvaluationResponse = ApiMyBadges & {
  awarded: ApiUserBadge[];
};

export function evaluateMyBadges() {
  return dottiRequest<BadgeEvaluationResponse>("/me/badges/evaluate", {
    method: "POST",
  });
}
