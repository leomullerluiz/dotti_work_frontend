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

export type BadgeNotificationViewedInput = {
  slugs?: string[];
  ids?: number[];
  notification_seen?: boolean;
};

export type BadgeNotificationViewedResponse = {
  updated_count: number;
  recently_awarded: ApiUserBadge[];
  unseen_awarded: ApiUserBadge[];
  unseen_awarded_count: number;
};

export function markBadgeNotificationsViewed(
  input: BadgeNotificationViewedInput,
) {
  return dottiRequest<BadgeNotificationViewedResponse>(
    "/me/badges/notifications/viewed",
    {
      method: "POST",
      body: input,
    },
  );
}
