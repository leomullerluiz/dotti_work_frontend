import assert from "node:assert/strict";
import test from "node:test";
import { STORAGE_KEYS } from "../data/constants";
import {
  cleanupLocalStorage,
  createPendingOnboardingEnvelope,
  parsePendingOnboardingValue,
  persistPendingOnboarding,
  readPendingOnboarding,
} from "../services/dotti/localStorageStrategy";
import type { DeveloperProfile } from "../types";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const profile: DeveloperProfile = {
  name: "Ada",
  role: "Full Stack Developer",
  seniority: "Senior",
  goal: "Build portfolio",
  technologies: [
    {
      name: "TypeScript",
      category: "Languages",
      level: "Daily use",
    },
  ],
  preferences: {
    contributionTypes: ["Bug fix"],
    difficulty: "Beginner",
    projectSize: "Small",
    activityLevel: "Very active",
    preferredLanguage: "Any",
    organizationType: "Community",
  },
  completedOnboarding: true,
  updatedAt: "2026-07-05T12:00:00.000Z",
};

test("localStorage strategy manages pending onboarding with TTL", () => {
  const now = Date.parse("2026-07-05T12:00:00.000Z");
  const storage = new MemoryStorage();

  persistPendingOnboarding(storage, profile, now);

  assert.deepEqual(readPendingOnboarding(storage, now + 1000), profile);
  assert.equal(
    readPendingOnboarding(storage, now + 24 * 60 * 60 * 1000 + 1),
    null,
  );
  assert.equal(storage.getItem(STORAGE_KEYS.pendingOnboarding), null);
});

test("localStorage strategy parses legacy pending onboarding only inside TTL", () => {
  const now = Date.parse("2026-07-05T12:30:00.000Z");
  const legacy = JSON.stringify(profile);

  assert.deepEqual(parsePendingOnboardingValue(legacy, now), profile);
  assert.equal(
    parsePendingOnboardingValue(
      legacy,
      Date.parse("2026-07-07T12:00:00.000Z"),
    ),
    null,
  );
});

test("localStorage cleanup removes authenticated data and legacy keys", () => {
  const now = Date.parse("2026-07-05T12:00:00.000Z");
  const storage = new MemoryStorage();
  const expiredPending = createPendingOnboardingEnvelope(profile, now - 90_000_000);

  storage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  storage.setItem(STORAGE_KEYS.savedProjects, "[]");
  storage.setItem(STORAGE_KEYS.ignoredProjects, "[]");
  storage.setItem(STORAGE_KEYS.history, "[]");
  storage.setItem(STORAGE_KEYS.theme, JSON.stringify("dark"));
  storage.setItem(STORAGE_KEYS.filters, "{}");
  storage.setItem(STORAGE_KEYS.consent, "{}");
  storage.setItem(STORAGE_KEYS.pendingOnboarding, JSON.stringify(expiredPending));
  storage.setItem("dotti.token", "secret");
  storage.setItem("dotti.matchFilters", "{}");

  const result = cleanupLocalStorage({
    storage,
    isAuthenticated: true,
    nowMs: now,
  });

  assert.deepEqual(
    result.removed.sort(),
    [
      STORAGE_KEYS.profile,
      STORAGE_KEYS.savedProjects,
      STORAGE_KEYS.ignoredProjects,
      STORAGE_KEYS.history,
      STORAGE_KEYS.pendingOnboarding,
      "dotti.matchFilters",
      "dotti.token",
    ].sort(),
  );
  assert.equal(storage.getItem(STORAGE_KEYS.profile), null);
  assert.equal(storage.getItem(STORAGE_KEYS.theme), JSON.stringify("dark"));
  assert.equal(storage.getItem(STORAGE_KEYS.filters), "{}");
  assert.equal(storage.getItem(STORAGE_KEYS.consent), "{}");
});

test("localStorage cleanup keeps local fallback data before authentication", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  storage.setItem(STORAGE_KEYS.history, "[]");

  const result = cleanupLocalStorage({
    storage,
    isAuthenticated: false,
  });

  assert.deepEqual(result.removed, []);
  assert.notEqual(storage.getItem(STORAGE_KEYS.profile), null);
  assert.notEqual(storage.getItem(STORAGE_KEYS.history), null);
});
