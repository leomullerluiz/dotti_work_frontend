import { STORAGE_KEYS } from "../../data/constants";
import {
  CONSENT_POLICY_VERSION,
  OPTIONAL_CONSENT_TYPES,
} from "./consentPreferences";
import type { ApiConsentType } from "./types";

type ConsentDecision = "accepted" | "declined";

export type StoredPrivacyConsent = {
  decision: ConsentDecision;
  source: "home" | "settings";
  version: string;
  decidedAt: string;
  optional?: Partial<Record<ApiConsentType, boolean>>;
};

function fallbackOptional(decision: ConsentDecision) {
  return Object.fromEntries(
    OPTIONAL_CONSENT_TYPES.map((type) => [type, decision === "accepted"]),
  ) as Partial<Record<ApiConsentType, boolean>>;
}

export function readStoredPrivacyConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.consent);
    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as Partial<StoredPrivacyConsent>;
    if (
      parsed.version !== CONSENT_POLICY_VERSION ||
      (parsed.decision !== "accepted" && parsed.decision !== "declined")
    ) {
      return null;
    }

    return {
      decision: parsed.decision,
      source: parsed.source === "settings" ? "settings" : "home",
      version: parsed.version,
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
      optional: parsed.optional ?? fallbackOptional(parsed.decision),
    } satisfies StoredPrivacyConsent;
  } catch {
    return null;
  }
}

export function writeStoredPrivacyConsent(consent: StoredPrivacyConsent) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(consent));
  window.dispatchEvent(new Event("dotti-consent-change"));
}

export function saveLocalConsentDecision(decision: ConsentDecision) {
  writeStoredPrivacyConsent({
    decision,
    source: "home",
    version: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    optional: fallbackOptional(decision),
  });
}

export function hasLocalOptionalConsent(type: ApiConsentType) {
  const stored = readStoredPrivacyConsent();

  if (!stored) {
    return false;
  }

  if (type === "essential") {
    return true;
  }

  return Boolean(stored.optional?.[type]);
}

export function syncLocalOptionalConsent(
  type: ApiConsentType,
  granted: boolean,
) {
  if (type === "essential") {
    return;
  }

  const existing = readStoredPrivacyConsent();
  const optional = {
    ...(existing?.optional ?? fallbackOptional("declined")),
    [type]: granted,
  };
  const anyOptionalGranted = Object.values(optional).some(Boolean);

  writeStoredPrivacyConsent({
    decision: anyOptionalGranted ? "accepted" : "declined",
    source: "settings",
    version: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    optional,
  });
}
