import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

const sourceRoots = ["app", "components", "contexts", "hooks", "services"];
const sourceExtensions = [".ts", ".tsx"];

function sourceFiles(root: string): string[] {
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      const stats = statSync(path);

      if (stats.isDirectory()) {
        walk(path);
        continue;
      }

      if (sourceExtensions.some((extension) => path.endsWith(extension))) {
        files.push(path);
      }
    }
  }

  walk(root);
  return files;
}

function readSourceFiles() {
  return sourceRoots.flatMap((root) =>
    sourceFiles(root).map((path) => ({
      path: relative(".", path).split(sep).join("/"),
      text: readFileSync(path, "utf8"),
    })),
  );
}

test("acceptance criteria keep authenticated areas off repository mocks", () => {
  const offenders = readSourceFiles()
    .filter(({ text }) => /data\/repositories|mockProjects/.test(text))
    .map(({ path }) => path);

  assert.deepEqual(offenders, []);
});

test("acceptance criteria keep API services wired to OpenAPI endpoints", () => {
  const expectations = [
    ["services/dotti/matches.ts", /\/matches/],
    ["services/dotti/matches.ts", /\/matches\/refresh/],
    ["services/dotti/repositories.ts", /\/repositories/],
    ["services/dotti/repositoryStates.ts", /\/me\/repositories/],
    ["services/dotti/history.ts", /\/me\/history/],
    ["services/dotti/profile.ts", /\/me\/profile/],
    ["services/dotti/profile.ts", /\/me\/technologies/],
    ["services/dotti/profile.ts", /\/me\/preferences/],
    ["services/dotti/githubIntegration.ts", /\/integrations\/github\/status/],
    ["services/dotti/githubIntegration.ts", /\/integrations\/github\/sync/],
    ["services/dotti/githubIntegration.ts", /\/integrations\/github/],
    ["services/dotti/account.ts", /\/me\/export/],
    ["services/dotti/account.ts", /\/me\/import-local-data/],
    ["services/dotti/account.ts", /\/me\/account/],
    ["services/dotti/consents.ts", /\/me\/consents/],
    ["services/dotti/badges.ts", /\/badges/],
    ["services/dotti/badges.ts", /\/me\/badges/],
    ["services/dotti/badges.ts", /\/me\/badges\/notifications\/viewed/],
  ] as const;

  for (const [path, expected] of expectations) {
    assert.ok(
      expected.test(readFileSync(path, "utf8")),
      `${path} should include ${expected}`,
    );
  }
});

test("acceptance criteria restrict localStorage to documented fallback surfaces", () => {
  const allowedFiles = new Set([
    "app/layout.tsx",
    "app/privacy/page.tsx",
    "components/onboarding/MultiStepOnboarding.tsx",
    "components/settings/SettingsPage.tsx",
    "contexts/AuthContext.tsx",
    "contexts/LocalStorageMaintenance.tsx",
    "hooks/useLocalStorage.ts",
    "services/dotti/consentStorage.ts",
    "services/dotti/localStorageStrategy.ts",
  ]);

  const offenders = readSourceFiles()
    .filter(({ text }) => text.includes("localStorage"))
    .map(({ path }) => path)
    .filter((path) => !allowedFiles.has(path));

  assert.deepEqual(offenders, []);
});

test("acceptance criteria keep primary authenticated pages with loading, error, and empty states", () => {
  const pages = [
    "components/projects/MatchesPage.tsx",
    "components/projects/SavedProjectsPage.tsx",
    "components/history/HistoryPage.tsx",
    "components/profile/ProfilePage.tsx",
  ];

  for (const path of pages) {
    const text = readFileSync(path, "utf8");
    assert.ok(/isLoading|Skeleton/.test(text), `${path} should expose loading UI`);
    assert.ok(/error|Could not/.test(text), `${path} should expose error UI`);
    assert.ok(/EmptyState|No /.test(text), `${path} should expose empty UI`);
  }
});
