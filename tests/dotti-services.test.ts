import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

process.env.NEXT_PUBLIC_DOTTI_API_BASE_URL = "http://localhost/api";

type QueuedResponse = {
  status: number;
  body: unknown;
};

type CapturedRequest = {
  url: string;
  init?: RequestInit;
};

const capturedRequests: CapturedRequest[] = [];
const queuedResponses: QueuedResponse[] = [];

function resetFetchMock() {
  capturedRequests.length = 0;
  queuedResponses.length = 0;
}

function enqueueData(data: unknown, status = 200) {
  queuedResponses.push({
    status,
    body: {
      success: true,
      data,
    },
  });
}

function enqueueError(
  status: number,
  error: { code?: string; message?: string; details?: unknown },
) {
  queuedResponses.push({
    status,
    body: {
      success: false,
      error,
    },
  });
}

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = queuedResponses.shift();
  assert.ok(response, "Expected a queued API response for fetch mock");

  capturedRequests.push({
    url: String(input),
    init,
  });

  return new Response(JSON.stringify(response.body), {
    status: response.status,
    headers: {
      "content-type": "application/json",
    },
  });
};

function lastRequest() {
  const request = capturedRequests.at(-1);
  assert.ok(request, "Expected service to call fetch");
  return request;
}

function lastUrl() {
  return new URL(lastRequest().url);
}

function assertJsonBody(expected: unknown) {
  assert.equal(lastRequest().init?.body, JSON.stringify(expected));
}

function assertHeader(name: string, value: string) {
  const headers = lastRequest().init?.headers;
  assert.ok(headers instanceof Headers, "Expected Headers instance");
  assert.equal(headers.get(name), value);
}

test("dotti service layer follows the OpenAPI service contract", async (t) => {
  const openapi = readFileSync("openapi.yaml", "utf8");

  await t.test("openapi.yaml exposes the service operations under test", () => {
    [
      ["  /matches:", "operationId: listMatches"],
      ["  /matches/refresh:", "operationId: refreshMatches"],
      ["  /matches/{githubRepositoryId}:", "operationId: getMatchByRepositoryId"],
      ["  /repositories/{owner}/{repo}:", "operationId: getRepository"],
      ["  /repositories/{owner}/{repo}/issues:", "operationId: listRepositoryIssues"],
      ["  /repositories/{owner}/{repo}/activity:", "operationId: createRepositoryActivity"],
      ["  /me/repositories:", "operationId: listMyRepositoryStates"],
      ["  /me/repositories/{githubRepositoryId}/state:", "operationId: setRepositoryState"],
      ["  /me/repositories/{githubRepositoryId}/restore:", "operationId: restoreRepositoryState"],
      ["  /me/history:", "operationId: listMyHistory"],
      ["  /me/profile:", "operationId: getMyProfile"],
      ["  /me/technologies:", "operationId: getMyTechnologies"],
      ["  /me/preferences:", "operationId: getMyPreferences"],
      ["  /catalog/technologies:", "operationId: listTechnologies"],
      ["  /integrations/github/status:", "operationId: getGitHubIntegrationStatus"],
      ["  /integrations/github/sync:", "operationId: syncGitHubProfile"],
      ["  /integrations/github:", "operationId: disconnectGitHubIntegration"],
      ["  /me/consents:", "operationId: listMyConsents"],
      ["  /me/consents/{type}:", "operationId: revokeMyConsent"],
    ].forEach(([path, operationId]) => {
      assert.ok(openapi.includes(path), `Expected ${path} in openapi.yaml`);
      assert.ok(
        openapi.includes(operationId),
        `Expected ${operationId} in openapi.yaml`,
      );
    });
  });

  const client = await import("../services/dotti/client");
  const matches = await import("../services/dotti/matches");
  const repositories = await import("../services/dotti/repositories");
  const repositoryStates = await import("../services/dotti/repositoryStates");
  const history = await import("../services/dotti/history");
  const githubIntegration = await import("../services/dotti/githubIntegration");
  const consents = await import("../services/dotti/consents");
  const profile = await import("../services/dotti/profile");

  await t.test("matches service serializes filters and unwraps envelopes", async () => {
    resetFetchMock();
    enqueueData({
      items: [],
      pagination: { next_cursor: "next" },
      metadata: { cached: true },
    });

    const response = await matches.listMatches({
      q: "react",
      state: "saved",
      minimum_score: 80,
      technology: ["react", "typescript"],
      language: "TypeScript",
      difficulty: "beginner",
      project_size: "small",
      activity: "very_active",
      has_good_first_issue: true,
      has_help_wanted: false,
      minimum_health_score: 70,
      sort_by: "best_match",
      limit: 25,
      cursor: "abc",
    });

    const url = lastUrl();
    assert.equal(url.pathname, "/api/matches");
    assert.equal(url.searchParams.get("q"), "react");
    assert.equal(url.searchParams.get("state"), "saved");
    assert.equal(url.searchParams.get("minimum_score"), "80");
    assert.deepEqual(url.searchParams.getAll("technology"), [
      "react",
      "typescript",
    ]);
    assert.equal(url.searchParams.get("language"), "TypeScript");
    assert.equal(url.searchParams.get("difficulty"), "beginner");
    assert.equal(url.searchParams.get("project_size"), "small");
    assert.equal(url.searchParams.get("activity"), "very_active");
    assert.equal(url.searchParams.get("has_good_first_issue"), "true");
    assert.equal(url.searchParams.get("has_help_wanted"), "false");
    assert.equal(url.searchParams.get("minimum_health_score"), "70");
    assert.equal(url.searchParams.get("sort_by"), "best_match");
    assert.equal(url.searchParams.get("limit"), "25");
    assert.equal(url.searchParams.get("cursor"), "abc");
    assert.equal(lastRequest().init?.cache, "no-store");
    assert.equal(lastRequest().init?.credentials, "include");
    assert.equal(response.metadata?.cached, true);
  });

  await t.test("matches mutations and detail use contract endpoints", async () => {
    resetFetchMock();
    enqueueData({ refreshed: true, items: [] });
    await matches.refreshMatches();

    assert.equal(lastUrl().pathname, "/api/matches/refresh");
    assert.equal(lastRequest().init?.method, "POST");

    resetFetchMock();
    enqueueData({
      repository: {},
      match: {},
      user_state: null,
    });
    await matches.getMatch(123);

    assert.equal(lastUrl().pathname, "/api/matches/123");
  });

  await t.test("repositories service uses detail, issues, and activity endpoints", async () => {
    resetFetchMock();
    enqueueData({
      repository: { owner: "open nova", name: "nova/ui" },
      health: null,
      user_state: null,
      match: null,
    });
    await repositories.getRepository("open nova", "nova/ui");

    assert.equal(lastUrl().pathname, "/api/repositories/open%20nova/nova%2Fui");

    resetFetchMock();
    enqueueData({
      items: [],
      pagination: { next_cursor: null },
    });
    await repositories.listRepositoryIssues("owner", "repo", {
      difficulty: "beginner",
      label: "good first issue",
      limit: 10,
      cursor: 2,
    });

    assert.equal(lastUrl().pathname, "/api/repositories/owner/repo/issues");
    assert.equal(lastUrl().searchParams.get("difficulty"), "beginner");
    assert.equal(lastUrl().searchParams.get("label"), "good first issue");
    assert.equal(lastUrl().searchParams.get("limit"), "10");
    assert.equal(lastUrl().searchParams.get("cursor"), "2");

    resetFetchMock();
    enqueueData({
      event: {
        id: 1,
        event_type: "opened_github",
        created_at: "2026-07-04T12:00:00Z",
      },
    });
    const event = await repositories.registerRepositoryActivity("owner", "repo", {
      event_type: "opened_github",
    });

    assert.equal(lastUrl().pathname, "/api/repositories/owner/repo/activity");
    assert.equal(lastRequest().init?.method, "POST");
    assertJsonBody({ event_type: "opened_github" });
    assertHeader("content-type", "application/json");
    assert.equal(event.event_type, "opened_github");
  });

  await t.test("repository state service uses /me/repositories endpoints", async () => {
    resetFetchMock();
    enqueueData({
      items: [],
      pagination: { next_cursor: null },
    });
    await repositoryStates.listUserRepositories({
      state: "working",
      limit: 20,
      cursor: "page-2",
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories");
    assert.equal(lastUrl().searchParams.get("state"), "working");
    assert.equal(lastUrl().searchParams.get("limit"), "20");
    assert.equal(lastUrl().searchParams.get("cursor"), "page-2");

    resetFetchMock();
    enqueueData({
      state: {
        github_repository_id: 123,
        state: "pull_request_sent",
      },
    });
    const savedState = await repositoryStates.setRepositoryState(123, {
      state: "pull_request_sent",
      notes: "PR aberto",
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({ state: "pull_request_sent", notes: "PR aberto" });
    assert.equal(savedState.state, "pull_request_sent");

    resetFetchMock();
    enqueueData({ removed: true });
    await repositoryStates.deleteRepositoryState(123);

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "DELETE");

    resetFetchMock();
    enqueueData({
      state: {
        github_repository_id: 123,
        state: "saved",
      },
    });
    const restoredState = await repositoryStates.restoreRepository(123);

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/restore");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(restoredState.state, "saved");
  });

  await t.test("history service lists and clears history", async () => {
    resetFetchMock();
    enqueueData({
      items: [],
      pagination: { next_cursor: null },
    });
    await history.listHistory({
      event_type: "opened_github",
      github_repository_id: 123,
      limit: 15,
      cursor: "older",
    });

    assert.equal(lastUrl().pathname, "/api/me/history");
    assert.equal(lastUrl().searchParams.get("event_type"), "opened_github");
    assert.equal(lastUrl().searchParams.get("github_repository_id"), "123");
    assert.equal(lastUrl().searchParams.get("limit"), "15");
    assert.equal(lastUrl().searchParams.get("cursor"), "older");

    resetFetchMock();
    enqueueData({ deleted: 3 });
    const response = await history.clearHistory();

    assert.equal(lastUrl().pathname, "/api/me/history");
    assert.equal(lastRequest().init?.method, "DELETE");
    assert.equal(response.deleted, 3);
  });

  await t.test("github integration service uses status, sync, and disconnect", async () => {
    resetFetchMock();
    enqueueData({
      github: {
        connected: true,
        login: "octocat",
        provider: "github",
        scope: "read:user",
        token_last_verified_at: null,
      },
    });
    const status = await githubIntegration.getGitHubIntegrationStatus();

    assert.equal(lastUrl().pathname, "/api/integrations/github/status");
    assert.equal(status.login, "octocat");

    resetFetchMock();
    enqueueData({
      user: {
        id: 1,
        login: "octocat",
        display_name: "Octo Cat",
        email: null,
        avatar_url: null,
        bio: null,
        location: null,
        company: null,
        website_url: null,
        github_profile_url: null,
        created_at: null,
        updated_at: null,
      },
    });
    await githubIntegration.syncGitHubIntegration();

    assert.equal(lastUrl().pathname, "/api/integrations/github/sync");
    assert.equal(lastRequest().init?.method, "POST");

    resetFetchMock();
    enqueueData({ connected: false });
    const disconnect = await githubIntegration.disconnectGitHubIntegration();

    assert.equal(lastUrl().pathname, "/api/integrations/github");
    assert.equal(lastRequest().init?.method, "DELETE");
    assert.equal(disconnect.connected, false);
  });

  await t.test("profile service uses profile, technologies, preferences, and catalog endpoints", async () => {
    resetFetchMock();
    enqueueData({
      user: { id: 1, display_name: "Ada" },
      profile: {
        role: "Front-end Developer",
        seniority: "mid",
        goals: ["build_portfolio"],
        onboarding_completed: true,
      },
    });
    await profile.getMyProfile();

    assert.equal(lastUrl().pathname, "/api/me/profile");

    resetFetchMock();
    enqueueData({
      user: { id: 1, display_name: "Ada" },
      profile: { role: "Back-end Developer" },
    });
    await profile.updateMyProfile({
      display_name: "Ada",
      role: "Back-end Developer",
      seniority: "senior",
      goals: ["first_contribution"],
      onboarding_completed: true,
    });

    assert.equal(lastUrl().pathname, "/api/me/profile");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({
      display_name: "Ada",
      role: "Back-end Developer",
      seniority: "senior",
      goals: ["first_contribution"],
      onboarding_completed: true,
    });

    resetFetchMock();
    enqueueData({ technologies: [] });
    await profile.getMyTechnologies();

    assert.equal(lastUrl().pathname, "/api/me/technologies");

    resetFetchMock();
    enqueueData({ technologies: [] });
    await profile.replaceMyTechnologies([
      {
        technology_id: 10,
        proficiency_level: "daily",
        interest_level: "contribute",
      },
    ]);

    assert.equal(lastUrl().pathname, "/api/me/technologies");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({
      technologies: [
        {
          technology_id: 10,
          proficiency_level: "daily",
          interest_level: "contribute",
        },
      ],
    });

    resetFetchMock();
    enqueueData({
      preferences: {
        contribution_types: ["bug_fix"],
        difficulty_levels: ["beginner"],
        project_sizes: ["small"],
        documentation_languages: ["any"],
        organization_types: ["community"],
      },
    });
    await profile.getMyPreferences();

    assert.equal(lastUrl().pathname, "/api/me/preferences");

    resetFetchMock();
    enqueueData({ preferences: {} });
    await profile.updateMyPreferences({
      contribution_types: ["documentation"],
      difficulty_levels: ["intermediate"],
      project_sizes: ["medium"],
      documentation_languages: ["en"],
      organization_types: ["company"],
      activity_window_days: 90,
      minimum_stars: 0,
      require_good_first_issue: false,
      require_help_wanted: false,
      default_sort_by: "best_match",
    });

    assert.equal(lastUrl().pathname, "/api/me/preferences");
    assert.equal(lastRequest().init?.method, "PUT");

    resetFetchMock();
    enqueueData({
      items: [],
      pagination: { next_cursor: null },
    });
    await profile.listTechnologies({
      active: true,
      limit: 100,
      category: "language",
      q: "type",
    });

    assert.equal(lastUrl().pathname, "/api/catalog/technologies");
    assert.equal(lastUrl().searchParams.get("active"), "true");
    assert.equal(lastUrl().searchParams.get("limit"), "100");
    assert.equal(lastUrl().searchParams.get("category"), "language");
    assert.equal(lastUrl().searchParams.get("q"), "type");
  });

  await t.test("consent service uses LGPD consent endpoints", async () => {
    const consent = {
      type: "analytics" as const,
      status: "granted" as const,
      policy_version: "2026-07-04",
      source: "settings" as const,
      created_at: "2026-07-04 12:00:00",
      revoked_at: null,
    };

    resetFetchMock();
    enqueueData({ consents: [consent] });
    const listedConsents = await consents.listConsents();

    assert.equal(lastUrl().pathname, "/api/me/consents");
    assert.deepEqual(listedConsents, [consent]);

    resetFetchMock();
    enqueueData({ consent });
    const grantedConsent = await consents.grantConsent({
      type: "analytics",
      policy_version: "2026-07-04",
      source: "settings",
    });

    assert.equal(lastUrl().pathname, "/api/me/consents");
    assert.equal(lastRequest().init?.method, "POST");
    assertJsonBody({
      type: "analytics",
      policy_version: "2026-07-04",
      source: "settings",
    });
    assert.equal(grantedConsent.type, "analytics");

    resetFetchMock();
    enqueueData({
      consent: {
        ...consent,
        status: "revoked",
        revoked_at: "2026-07-04 12:30:00",
      },
    });
    const revokedConsent = await consents.revokeConsent("analytics");

    assert.equal(lastUrl().pathname, "/api/me/consents/analytics");
    assert.equal(lastRequest().init?.method, "DELETE");
    assert.equal(revokedConsent.status, "revoked");
  });

  await t.test("services propagate DottiApiError from the central client", async () => {
    resetFetchMock();
    enqueueError(429, {
      code: "rate_limited",
      message: "Tente novamente mais tarde.",
      details: { retry_after: 60 },
    });

    await assert.rejects(
      () => history.listHistory(),
      (error: unknown) => {
        assert.ok(error instanceof client.DottiApiError);
        assert.equal(error.status, 429);
        assert.equal(error.code, "rate_limited");
        assert.equal(error.message, "Tente novamente mais tarde.");
        assert.deepEqual(error.details, { retry_after: 60 });
        return true;
      },
    );
  });
});
