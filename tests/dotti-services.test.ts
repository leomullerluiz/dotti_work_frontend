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
      ["  /repositories/top:", "operationId: listTopRepositories"],
      ["  /repositories/{owner}/{repo}:", "operationId: getRepository"],
      ["  /repositories/{owner}/{repo}/issues:", "operationId: listRepositoryIssues"],
      ["  /repositories/{owner}/{repo}/activity:", "operationId: createRepositoryActivity"],
      ["  /me/repositories:", "operationId: listMyRepositoryStates"],
      ["  /me/repositories/{githubRepositoryId}/state:", "operationId: setRepositoryState"],
      ["  /me/repositories/{githubRepositoryId}/restore:", "operationId: restoreRepositoryState"],
      ["  /me/history:", "operationId: listMyHistory"],
      ["  /me/profile:", "operationId: getMyProfile"],
      ["  /me/import-local-data:", "operationId: importLocalData"],
      ["  /me/export:", "operationId: exportMyData"],
      ["  /me/account:", "operationId: deleteMyAccount"],
      ["  /me/technologies:", "operationId: getMyTechnologies"],
      ["  /me/preferences:", "operationId: getMyPreferences"],
      ["  /auth/logout-all:", "operationId: logoutAllSessions"],
      ["  /catalog/technologies:", "operationId: listTechnologies"],
      ["  /integrations/github/status:", "operationId: getGitHubIntegrationStatus"],
      ["  /integrations/github/sync:", "operationId: syncGitHubProfile"],
      ["  /integrations/github:", "operationId: disconnectGitHubIntegration"],
      ["  /me/consents:", "operationId: listMyConsents"],
      ["  /me/consents:", "operationId: grantMyConsent"],
      ["  /me/consents/{type}:", "operationId: revokeMyConsent"],
      ["  /auth/github/start:", "operationId: startGitHubOAuth"],
      ["  /me/invite-links:", "operationId: listMyInviteLinks"],
      ["  /me/invite-links:", "operationId: createMyInviteLink"],
      ["  /me/invite-links/{id}/revoke:", "operationId: revokeMyInviteLink"],
      ["  /me/referrals:", "operationId: listMyReferrals"],
      ["  /invites/{code}:", "operationId: getPublicInvite"],
      ["  /badges:", "operationId: listBadgeCatalog"],
      ["  /me/badges:", "operationId: listMyBadges"],
      ["  /me/badges/evaluate:", "operationId: evaluateMyBadges"],
      ["  /public/profiles/{login}:", "operationId: getPublicUserProfile"],
      ["  /me/public-profile:", "operationId: previewMyPublicProfile"],
      [
        "  /me/public-profile/settings:",
        "operationId: updateMyPublicProfileSettings",
      ],
    ].forEach(([path, operationId]) => {
      assert.ok(openapi.includes(path), `Expected ${path} in openapi.yaml`);
      assert.ok(
        openapi.includes(operationId),
        `Expected ${operationId} in openapi.yaml`,
      );
    });
  });

  const client = await import("../services/dotti/client");
  const account = await import("../services/dotti/account");
  const auth = await import("../services/dotti/auth");
  const matches = await import("../services/dotti/matches");
  const topRepositories = await import("../services/dotti/topRepositories");
  const repositories = await import("../services/dotti/repositories");
  const repositoryStates = await import("../services/dotti/repositoryStates");
  const history = await import("../services/dotti/history");
  const githubIntegration = await import("../services/dotti/githubIntegration");
  const consents = await import("../services/dotti/consents");
  const profile = await import("../services/dotti/profile");
  const invites = await import("../services/dotti/invites");
  const badges = await import("../services/dotti/badges");
  const publicProfile = await import("../services/dotti/publicProfile");

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

  await t.test("top repositories service serializes ranking filters", async () => {
    resetFetchMock();
    enqueueData({
      items: [
        {
          repository: {
            github_repository_id: 123,
            owner: "open-nova",
            name: "nova-ui",
            stars: 1000,
            open_issues: 20,
            contributors: 12,
          },
          rank: 1,
          rank_metric: {
            type: "contributors",
            value: 12,
          },
          user_state: null,
        },
      ],
      pagination: { next_cursor: "page-2" },
      metadata: {
        sort_by: "contributors",
        technology: "typescript",
        generated_at: "2026-07-10T12:00:00Z",
        cached: true,
      },
    });

    const response = await topRepositories.listTopRepositories({
      sort_by: "contributors",
      technology: "typescript",
      limit: 30,
      cursor: "abc",
    });

    const url = lastUrl();
    assert.equal(url.pathname, "/api/repositories/top");
    assert.equal(url.searchParams.get("sort_by"), "contributors");
    assert.equal(url.searchParams.get("technology"), "typescript");
    assert.equal(url.searchParams.get("limit"), "30");
    assert.equal(url.searchParams.get("cursor"), "abc");
    assert.equal(lastRequest().init?.cache, "no-store");
    assert.equal(lastRequest().init?.credentials, "include");
    assert.equal(response.items[0]?.repository.contributors, 12);
    assert.equal(response.metadata?.cached, true);
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
        state: "saved",
      },
    });
    const savedState = await repositoryStates.setRepositoryState(123, {
      state: "saved",
      notes: "Salvar para avaliar",
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({ state: "saved", notes: "Salvar para avaliar" });
    assert.equal(savedState.state, "saved");

    resetFetchMock();
    enqueueData({
      state: {
        github_repository_id: 123,
        state: "ignored",
      },
    });
    const ignoredState = await repositoryStates.setRepositoryState(123, {
      state: "ignored",
      notes: "Nao combina agora",
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({ state: "ignored", notes: "Nao combina agora" });
    assert.equal(ignoredState.state, "ignored");

    resetFetchMock();
    enqueueData({
      state: {
        github_repository_id: 123,
        state: "working",
      },
    });
    const workingState = await repositoryStates.setRepositoryState(123, {
      state: "working",
      notes: null,
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({ state: "working", notes: null });
    assert.equal(workingState.state, "working");

    resetFetchMock();
    enqueueData({
      state: {
        github_repository_id: 123,
        state: "pull_request_sent",
      },
    });
    const pullRequestState = await repositoryStates.setRepositoryState(123, {
      state: "pull_request_sent",
      notes: "PR aberto",
    });

    assert.equal(lastUrl().pathname, "/api/me/repositories/123/state");
    assert.equal(lastRequest().init?.method, "PUT");
    assertJsonBody({ state: "pull_request_sent", notes: "PR aberto" });
    assert.equal(pullRequestState.state, "pull_request_sent");

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
    const synced = await githubIntegration.syncGitHubIntegration();

    assert.equal(lastUrl().pathname, "/api/integrations/github/sync");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(synced.user.display_name, "Octo Cat");

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

  await t.test("account data service uses export, import, delete, and logout-all endpoints", async () => {
    resetFetchMock();
    enqueueData({
      user: { id: 1, login: "octocat" },
      profile: { onboarding_completed: true },
      technologies: [],
      preferences: {
        contribution_types: [],
        difficulty_levels: [],
        project_sizes: [],
        documentation_languages: [],
        organization_types: [],
      },
      repository_states: [],
      history: [],
    });
    const exported = await account.exportMyData();

    assert.equal(lastUrl().pathname, "/api/me/export");
    assert.equal(exported.user.login, "octocat");

    resetFetchMock();
    enqueueData({
      user: { id: 1, login: "octocat" },
      profile: { onboarding_completed: true },
      technologies: [],
      preferences: {
        contribution_types: [],
        difficulty_levels: [],
        project_sizes: [],
        documentation_languages: [],
        organization_types: [],
      },
      repository_states: [],
      history: [],
    });
    await account.importLocalData({
      profile: {
        display_name: "Octo Cat",
        role: "Maintainer",
        seniority: "senior",
        goals: ["build_portfolio"],
        onboarding_completed: true,
      },
      technologies: [
        {
          technology_id: 10,
          proficiency_level: "daily",
          interest_level: "contribute",
        },
      ],
      preferences: {
        contribution_types: ["bug_fix"],
        difficulty_levels: ["beginner"],
        project_sizes: ["small"],
        documentation_languages: ["any"],
        organization_types: ["community"],
      },
      repository_states: [
        {
          github_repository_id: 123,
          state: "saved",
          notes: null,
        },
      ],
      history: [
        {
          event_type: "opened_github",
          github_repository_id: 123,
        },
      ],
    });

    assert.equal(lastUrl().pathname, "/api/me/import-local-data");
    assert.equal(lastRequest().init?.method, "POST");
    assertJsonBody({
      profile: {
        display_name: "Octo Cat",
        role: "Maintainer",
        seniority: "senior",
        goals: ["build_portfolio"],
        onboarding_completed: true,
      },
      technologies: [
        {
          technology_id: 10,
          proficiency_level: "daily",
          interest_level: "contribute",
        },
      ],
      preferences: {
        contribution_types: ["bug_fix"],
        difficulty_levels: ["beginner"],
        project_sizes: ["small"],
        documentation_languages: ["any"],
        organization_types: ["community"],
      },
      repository_states: [
        {
          github_repository_id: 123,
          state: "saved",
          notes: null,
        },
      ],
      history: [
        {
          event_type: "opened_github",
          github_repository_id: 123,
        },
      ],
    });

    resetFetchMock();
    enqueueData({ deleted: true });
    const deleted = await account.deleteMyAccount();

    assert.equal(lastUrl().pathname, "/api/me/account");
    assert.equal(lastRequest().init?.method, "DELETE");
    assert.equal(deleted.deleted, true);

    resetFetchMock();
    enqueueData({ revoked: true });
    const loggedOut = await auth.logoutAllSessions();

    assert.equal(lastUrl().pathname, "/api/auth/logout-all");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(loggedOut.revoked, true);
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

  await t.test("invite service uses invite link and referral endpoints", async () => {
    resetFetchMock();
    enqueueData({
      invite_links: [
        {
          id: 10,
          code: "AbC123xYz_456789",
          url: "https://dotti.work/invite/AbC123xYz_456789",
          status: "active",
          uses_count: 2,
          expires_at: null,
          created_at: "2026-07-07 18:00:00",
        },
      ],
      summary: {
        effective_referrals: 2,
      },
    });
    const inviteLinks = await invites.listMyInviteLinks();

    assert.equal(lastUrl().pathname, "/api/me/invite-links");
    assert.equal(inviteLinks.summary.effective_referrals, 2);

    resetFetchMock();
    enqueueData({
      invite_link: {
        id: 10,
        code: "AbC123xYz_456789",
        url: "https://dotti.work/invite/AbC123xYz_456789",
        status: "active",
        uses_count: 0,
        expires_at: null,
        created_at: "2026-07-07 18:00:00",
      },
    });
    const created = await invites.createMyInviteLink();

    assert.equal(lastUrl().pathname, "/api/me/invite-links");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(created.invite_link.code, "AbC123xYz_456789");

    resetFetchMock();
    enqueueData({
      summary: {
        effective_referrals: 2,
      },
      referrals: [
        {
          registered_at: "2026-07-07 18:30:00",
          referred_user: {
            login: "octocat",
            display_name: "Octocat",
            avatar_url: null,
          },
        },
      ],
    });
    const referrals = await invites.listMyReferrals({ limit: 10 });

    assert.equal(lastUrl().pathname, "/api/me/referrals");
    assert.equal(lastUrl().searchParams.get("limit"), "10");
    assert.equal(referrals.referrals[0]?.referred_user.login, "octocat");

    resetFetchMock();
    enqueueData({
      invite: {
        code: "AbC123xYz_456789",
        valid: true,
        inviter: {
          display_name: "Leo",
          avatar_url: null,
        },
      },
    });
    const publicInvite = await invites.getPublicInvite("AbC123xYz_456789");

    assert.equal(lastUrl().pathname, "/api/invites/AbC123xYz_456789");
    assert.equal(publicInvite.invite.valid, true);

    resetFetchMock();
    enqueueData({ revoked: true });
    const revoked = await invites.revokeMyInviteLink(10);

    assert.equal(lastUrl().pathname, "/api/me/invite-links/10/revoke");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(revoked.revoked, true);
  });

  await t.test("badge service uses catalog, user progress, and evaluate endpoints", async () => {
    const badge = {
      slug: "explorer",
      name: "Explorer",
      description: "Viewed open source projects.",
      category: "discovery",
      level: "bronze",
      image_url: "https://dotti.work/assets/badges/explorer.png",
      image_alt: "Explorer badge",
      icon: "compass",
      is_secret: false,
      display_order: 20,
    };
    const userBadge = {
      id: 12,
      slug: "explorer",
      awarded_at: "2026-07-09 10:00:00",
      notification_seen: false,
      notification_seen_at: null,
      source_event_id: 99,
      progress_snapshot: {},
      badge,
    };

    resetFetchMock();
    enqueueData({ badges: [badge] });
    const catalog = await badges.listBadgeCatalog();

    assert.equal(lastUrl().pathname, "/api/badges");
    assert.equal(catalog[0]?.slug, "explorer");

    resetFetchMock();
    enqueueData({
      earned: [userBadge],
      progress: [
        {
          slug: "explorer",
          current_value: 3,
          target_value: 5,
          percent: 60,
          completed: false,
          badge,
        },
      ],
      recently_awarded: [userBadge],
      unseen_awarded: [userBadge],
      unseen_awarded_count: 1,
    });
    const myBadges = await badges.listMyBadges();

    assert.equal(lastUrl().pathname, "/api/me/badges");
    assert.equal(myBadges.progress[0]?.percent, 60);
    assert.equal(myBadges.unseen_awarded_count, 1);

    resetFetchMock();
    enqueueData({
      awarded: [userBadge],
      earned: [userBadge],
      progress: [],
      recently_awarded: [userBadge],
      unseen_awarded: [userBadge],
      unseen_awarded_count: 1,
    });
    const evaluated = await badges.evaluateMyBadges();

    assert.equal(lastUrl().pathname, "/api/me/badges/evaluate");
    assert.equal(lastRequest().init?.method, "POST");
    assert.equal(evaluated.awarded[0]?.slug, "explorer");

    resetFetchMock();
    enqueueData({
      updated_count: 1,
      recently_awarded: [
        {
          ...userBadge,
          notification_seen: true,
          notification_seen_at: "2026-07-09 10:05:00",
        },
      ],
      unseen_awarded: [],
      unseen_awarded_count: 0,
    });
    const viewed = await badges.markBadgeNotificationsViewed({
      slugs: ["explorer"],
      notification_seen: true,
    });

    assert.equal(lastUrl().pathname, "/api/me/badges/notifications/viewed");
    assert.equal(lastRequest().init?.method, "POST");
    assertJsonBody({
      slugs: ["explorer"],
      notification_seen: true,
    });
    assert.equal(viewed.updated_count, 1);
    assert.equal(viewed.unseen_awarded_count, 0);
  });

  await t.test("public profile service uses public and authenticated endpoints", async () => {
    const publicProfileData = {
      profile: {
        login: "ana-dev",
        display_name: "Ana Dev",
        avatar_url: null,
        bio: "Frontend developer",
        location: null,
        company: null,
        website_url: null,
        github_profile_url: "https://github.com/ana-dev",
        role: "Frontend Developer",
        seniority: "mid",
        goals: [],
        joined_at: null,
        profile_frame: {
          slug: "first_key_first_egg_frame",
          name: "First to the key frame",
          image_url: null,
          style_config: {
            accent: "#f05d4f",
            ring: "#f8c14a",
            shadow: "#15202b",
            glow: "#fff3c4",
          },
          source_badge_slug: "first_key_first_egg",
          awarded_at: "2026-07-13 15:00:00",
        },
      },
      github: {
        login: "ana-dev",
        url: "https://github.com/ana-dev",
        connected: true,
      },
      technologies: [],
      metrics: {
        technologies_count: 0,
        badges_count: 0,
        repositories_saved_count: 0,
        repositories_contributed_count: 0,
        pull_requests_sent_count: 0,
        opened_github_count: 0,
        activity_days_count: 0,
        member_since: null,
        last_activity_at: null,
      },
      badges: [],
      featured_repositories: [],
      share: {
        canonical_url: "https://dotti.work/u/ana-dev",
        api_url: "https://api.dottiwork.com/api/v1/public/profiles/ana-dev",
      },
    };

    resetFetchMock();
    enqueueData(publicProfileData);
    const fetchedPublicProfile = await publicProfile.getPublicUserProfile("ana dev");

    assert.equal(lastUrl().pathname, "/api/public/profiles/ana%20dev");
    assert.equal(lastRequest().init?.credentials, "omit");
    assert.equal(fetchedPublicProfile.profile.login, "ana-dev");
    assert.equal(
      fetchedPublicProfile.profile.profile_frame?.source_badge_slug,
      "first_key_first_egg",
    );

    resetFetchMock();
    enqueueData({
      is_public: true,
      share_url: "https://dotti.work/u/ana-dev",
      profile: publicProfileData,
      warnings: [],
    });
    const preview = await publicProfile.getMyPublicProfilePreview();

    assert.equal(lastUrl().pathname, "/api/me/public-profile");
    assert.equal(lastRequest().init?.credentials, "include");
    assert.equal(preview.is_public, true);

    resetFetchMock();
    enqueueData({
      is_public: false,
      share_url: null,
      public_profile_slug: "ana-dev",
    });
    const settings = await publicProfile.updatePublicProfileSettings(false);

    assert.equal(lastUrl().pathname, "/api/me/public-profile/settings");
    assert.equal(lastRequest().init?.method, "PUT");
    assert.equal(lastRequest().init?.credentials, "include");
    assertJsonBody({ is_public: false });
    assert.equal(settings.is_public, false);
  });

  await t.test("github oauth helper includes invite_code when provided", () => {
    const oauthUrl = new URL(
      client.buildGitHubOAuthStartUrl("/onboarding", {
        inviteCode: " AbC123xYz_456789 ",
      }),
    );

    assert.equal(oauthUrl.pathname, "/api/auth/github/start");
    assert.equal(oauthUrl.searchParams.get("return_to"), "/onboarding");
    assert.equal(oauthUrl.searchParams.get("invite_code"), "AbC123xYz_456789");

    const normalOauthUrl = new URL(client.buildGitHubOAuthStartUrl("/matches"));
    assert.equal(normalOauthUrl.searchParams.has("invite_code"), false);
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

    resetFetchMock();
    enqueueError(503, {
      code: "service_unavailable",
      message: "Ranking temporariamente indisponivel.",
    });

    await assert.rejects(
      () => topRepositories.listTopRepositories({ sort_by: "stars" }),
      (error: unknown) => {
        assert.ok(error instanceof client.DottiApiError);
        assert.equal(error.status, 503);
        assert.equal(error.code, "service_unavailable");
        assert.equal(error.message, "Ranking temporariamente indisponivel.");
        return true;
      },
    );
  });
});
