import {
  LOCAL_STORAGE_EVENT_NAME,
  STORAGE_KEYS,
} from "../../data/constants";
import type { DeveloperProfile } from "@/types";

type StorageLike = Pick<Storage, "getItem" | "key" | "length" | "removeItem" | "setItem">;

type PendingOnboardingEnvelope = {
  kind: "dotti.pendingOnboarding";
  version: 1;
  profile: DeveloperProfile;
  createdAt: string;
  expiresAt: string;
};

export const PENDING_ONBOARDING_TTL_MS = 24 * 60 * 60 * 1000;

export const LOCAL_STORAGE_ALLOWED_KEYS = [
  STORAGE_KEYS.theme,
  STORAGE_KEYS.filters,
  STORAGE_KEYS.pendingOnboarding,
  STORAGE_KEYS.consent,
] as const;

export const AUTHENTICATED_LOCAL_DATA_KEYS = [
  STORAGE_KEYS.profile,
  STORAGE_KEYS.savedProjects,
  STORAGE_KEYS.ignoredProjects,
  STORAGE_KEYS.history,
] as const;

const legacyStorageKeys = [
  "dotti.projects",
  "dotti.projectStates",
  "dotti.matchFilters",
  "dotti.onboarding",
  "dotti.user",
  "dotti.token",
] as const;

function nowIso(nowMs: number) {
  return new Date(nowMs).toISOString();
}

function isDeveloperProfile(value: unknown): value is DeveloperProfile {
  return Boolean(
    value &&
      typeof value === "object" &&
      "role" in value &&
      "seniority" in value &&
      "technologies" in value &&
      Array.isArray((value as { technologies?: unknown }).technologies),
  );
}

function emitLocalStorageChange(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_EVENT_NAME, { detail: { key } }),
  );
}

function removeStorageKey(storage: StorageLike, key: string, removed: string[]) {
  if (storage.getItem(key) === null) {
    return;
  }

  storage.removeItem(key);
  removed.push(key);
  emitLocalStorageChange(key);
}

export function createPendingOnboardingEnvelope(
  profile: DeveloperProfile,
  nowMs = Date.now(),
): PendingOnboardingEnvelope {
  return {
    kind: "dotti.pendingOnboarding",
    version: 1,
    profile,
    createdAt: nowIso(nowMs),
    expiresAt: nowIso(nowMs + PENDING_ONBOARDING_TTL_MS),
  };
}

export function parsePendingOnboardingValue(
  value: string | null,
  nowMs = Date.now(),
) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as PendingOnboardingEnvelope).kind === "dotti.pendingOnboarding"
    ) {
      const envelope = parsed as PendingOnboardingEnvelope;
      const expiresAt = new Date(envelope.expiresAt).getTime();

      if (!Number.isFinite(expiresAt) || expiresAt <= nowMs) {
        return null;
      }

      return isDeveloperProfile(envelope.profile) ? envelope.profile : null;
    }

    if (!isDeveloperProfile(parsed)) {
      return null;
    }

    const updatedAt = new Date(parsed.updatedAt).getTime();
    if (!Number.isFinite(updatedAt) || updatedAt + PENDING_ONBOARDING_TTL_MS <= nowMs) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readPendingOnboarding(
  storage: StorageLike,
  nowMs = Date.now(),
) {
  const value = storage.getItem(STORAGE_KEYS.pendingOnboarding);
  const profile = parsePendingOnboardingValue(value, nowMs);

  if (!profile && value !== null) {
    storage.removeItem(STORAGE_KEYS.pendingOnboarding);
    emitLocalStorageChange(STORAGE_KEYS.pendingOnboarding);
  }

  return profile;
}

export function persistPendingOnboarding(
  storage: StorageLike,
  profile: DeveloperProfile,
  nowMs = Date.now(),
) {
  storage.setItem(
    STORAGE_KEYS.pendingOnboarding,
    JSON.stringify(createPendingOnboardingEnvelope(profile, nowMs)),
  );
  emitLocalStorageChange(STORAGE_KEYS.pendingOnboarding);
}

export function clearPendingOnboarding(storage: StorageLike) {
  storage.removeItem(STORAGE_KEYS.pendingOnboarding);
  emitLocalStorageChange(STORAGE_KEYS.pendingOnboarding);
}

export function cleanupLocalStorage({
  storage,
  isAuthenticated,
  nowMs = Date.now(),
}: {
  storage: StorageLike;
  isAuthenticated: boolean;
  nowMs?: number;
}) {
  const removed: string[] = [];
  const pendingValue = storage.getItem(STORAGE_KEYS.pendingOnboarding);
  if (pendingValue !== null && !parsePendingOnboardingValue(pendingValue, nowMs)) {
    removeStorageKey(storage, STORAGE_KEYS.pendingOnboarding, removed);
  }

  legacyStorageKeys.forEach((key) => removeStorageKey(storage, key, removed));

  if (isAuthenticated) {
    AUTHENTICATED_LOCAL_DATA_KEYS.forEach((key) =>
      removeStorageKey(storage, key, removed),
    );
  }

  return { removed };
}
