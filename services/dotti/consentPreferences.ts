import type { ApiConsent, ApiConsentType } from "./types";

export const CONSENT_POLICY_VERSION = "2026-07-04";

export const CONSENT_TYPES: ApiConsentType[] = [
  "essential",
  "analytics",
  "sentry_replay",
  "marketing",
  "github_oauth_notice",
];

export const OPTIONAL_CONSENT_TYPES: ApiConsentType[] = [
  "analytics",
  "sentry_replay",
  "marketing",
  "github_oauth_notice",
];

export const consentLabels: Record<
  ApiConsentType,
  {
    title: string;
    description: string;
  }
> = {
  essential: {
    title: "Essential",
    description: "Required security, session, and account functionality.",
  },
  analytics: {
    title: "Analytics",
    description: "Optional product metrics used to understand app usage.",
  },
  sentry_replay: {
    title: "Sentry Replay",
    description: "Optional session replay diagnostics for debugging UI issues.",
  },
  marketing: {
    title: "Marketing",
    description: "Optional product communication and campaign preferences.",
  },
  github_oauth_notice: {
    title: "GitHub OAuth notice",
    description: "Acknowledgement of GitHub OAuth data use before sign-in.",
  },
};

export function isOptionalConsent(type: ApiConsentType) {
  return OPTIONAL_CONSENT_TYPES.includes(type);
}

export function consentByType(consents: ApiConsent[]) {
  return new Map(consents.map((consent) => [consent.type, consent]));
}

export function hasGrantedConsent(
  consents: ApiConsent[],
  type: ApiConsentType,
) {
  return consents.some(
    (consent) => consent.type === type && consent.status === "granted",
  );
}
