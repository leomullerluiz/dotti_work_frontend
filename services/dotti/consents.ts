import { dottiRequest } from "./client";
import type { ApiConsent, ApiConsentSource, ApiConsentType } from "./types";

export type GrantConsentInput = {
  type: ApiConsentType;
  policy_version: string;
  source: ApiConsentSource;
  status?: "granted";
};

export async function listConsents() {
  const response = await dottiRequest<{ consents: ApiConsent[] }>(
    "/me/consents",
  );

  return response.consents;
}

export async function grantConsent(input: GrantConsentInput) {
  const response = await dottiRequest<{ consent: ApiConsent }>("/me/consents", {
    method: "POST",
    body: input,
  });

  return response.consent;
}

export async function revokeConsent(type: ApiConsentType) {
  const response = await dottiRequest<{ consent: ApiConsent }>(
    `/me/consents/${encodeURIComponent(type)}`,
    {
      method: "DELETE",
    },
  );

  return response.consent;
}
