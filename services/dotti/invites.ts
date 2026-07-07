import { dottiRequest } from "./client";

export const PENDING_INVITE_CODE_STORAGE_KEY = "pending_invite_code";

export type InviteLinkStatus = "active" | "revoked" | "expired";

export type InviteLink = {
  id: number;
  code: string;
  url: string;
  status: InviteLinkStatus;
  uses_count: number;
  expires_at: string | null;
  created_at: string | null;
};

export type InviteSummary = {
  effective_referrals: number;
};

export type Referral = {
  registered_at: string;
  referred_user: {
    login?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  };
};

export type Inviter = {
  display_name: string | null;
  avatar_url: string | null;
};

export type PublicInvite = {
  code: string;
  valid: boolean;
  inviter: Inviter;
};

export function listMyInviteLinks() {
  return dottiRequest<{
    invite_links: InviteLink[];
    summary: InviteSummary;
  }>("/me/invite-links");
}

export function createMyInviteLink() {
  return dottiRequest<{
    invite_link: InviteLink;
  }>("/me/invite-links", {
    method: "POST",
  });
}

export function listMyReferrals(options: { limit?: number } = {}) {
  const params = new URLSearchParams();

  if (options.limit !== undefined) {
    params.set("limit", String(options.limit));
  }

  const query = params.toString();

  return dottiRequest<{
    summary: InviteSummary;
    referrals: Referral[];
  }>(`/me/referrals${query ? `?${query}` : ""}`);
}

export function getPublicInvite(code: string) {
  return dottiRequest<{
    invite: PublicInvite;
  }>(`/invites/${encodeURIComponent(code)}`);
}

export function revokeMyInviteLink(id: string | number) {
  return dottiRequest<{
    revoked: boolean;
  }>(`/me/invite-links/${encodeURIComponent(String(id))}/revoke`, {
    method: "POST",
  });
}
