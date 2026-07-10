import assert from "node:assert/strict";
import test from "node:test";
import {
  adaptApiHistoryEvent,
  adaptApiMatchToMatchedProject,
  adaptApiProfileToDeveloperProfile,
  adaptApiRepositoryDetailToMatchedProject,
  adaptApiRepositoryIssue,
  adaptApiRepositoryStates,
  adaptApiRepositorySummaryToMatchedProject,
  adaptApiTopRepositoryItemToMatchedProject,
  adaptApiUserRepositoryState,
  developerProfileToApiProfileInput,
  developerProfileToApiTechnologyInputs,
  localAppDataToApiImportInput,
  matchPreferencesToApiInput,
  apiRepositoryStateToProjectStatus,
  projectStatusToApiRepositoryState,
} from "../services/dotti/adapters";
import type {
  ApiHistoryEvent,
  ApiRepositoryIssue,
  ApiRepositoryMatchItem,
  ApiRepositorySummary,
  ApiTopRepositoryItem,
  ApiUserRepositoryState,
} from "../services/dotti/types";
import {
  consentByType,
  hasGrantedConsent,
  isOptionalConsent,
} from "../services/dotti/consentPreferences";

test("dotti API adapters normalize backend DTOs into visual types", async (t) => {
  await t.test("adapts API profile, technologies, and preferences into DeveloperProfile", () => {
    const profile = adaptApiProfileToDeveloperProfile({
      user: {
        login: "ada",
        display_name: "Ada Lovelace",
        updated_at: "2026-07-05T10:00:00Z",
      },
      profile: {
        role: "Front-end Developer",
        seniority: "mid",
        goals: ["build_portfolio"],
        onboarding_completed: true,
        updated_at: "2026-07-05T11:00:00Z",
      },
      technologies: [
        {
          technology_id: 1,
          name: "TypeScript",
          category: "language",
          proficiency_level: "daily",
          interest_level: "contribute",
        },
      ],
      preferences: {
        contribution_types: ["bug_fix", "documentation"],
        difficulty_levels: ["beginner"],
        project_sizes: ["small"],
        documentation_languages: ["any"],
        organization_types: ["community"],
        activity_window_days: 30,
        minimum_stars: 0,
        require_good_first_issue: true,
        require_help_wanted: false,
        default_sort_by: "best_match",
      },
    });

    assert.deepEqual(profile, {
      name: "Ada Lovelace",
      role: "Front-end Developer",
      seniority: "Mid-Level",
      goal: "Build portfolio",
      technologies: [
        {
          name: "TypeScript",
          category: "Languages",
          level: "Daily use",
        },
      ],
      preferences: {
        contributionTypes: ["Bug fix", "Documentation"],
        difficulty: "Beginner",
        projectSize: "Small",
        activityLevel: "Very active",
        preferredLanguage: "Any",
        organizationType: "Community",
      },
      completedOnboarding: true,
      updatedAt: "2026-07-05T11:00:00Z",
    });
  });

  await t.test("converts DeveloperProfile into profile, technology, and preference inputs", () => {
    const profile = {
      name: "Ada Lovelace",
      role: "Full Stack Developer",
      seniority: "Senior" as const,
      goal: "Make my first contribution",
      technologies: [
        {
          name: "TypeScript",
          category: "Languages" as const,
          level: "Advanced" as const,
        },
        {
          name: "Unknown Tech",
          category: "Tools" as const,
          level: "Basic" as const,
        },
      ],
      preferences: {
        contributionTypes: ["Feature" as const, "Tests" as const],
        difficulty: "Hard" as const,
        projectSize: "Large" as const,
        activityLevel: "Moderate" as const,
        preferredLanguage: "Any",
        organizationType: "Company-backed" as const,
      },
      completedOnboarding: true,
      updatedAt: "2026-07-05T12:00:00Z",
    };

    assert.deepEqual(developerProfileToApiProfileInput(profile), {
      display_name: "Ada Lovelace",
      role: "Full Stack Developer",
      seniority: "senior",
      goals: ["first_contribution"],
      onboarding_completed: true,
    });

    assert.deepEqual(
      developerProfileToApiTechnologyInputs(profile, [
        {
          id: 10,
          slug: "typescript",
          name: "TypeScript",
          category: "language",
        },
      ]),
      {
        technologies: [
          {
            technology_id: 10,
            proficiency_level: "advanced",
            interest_level: "contribute",
          },
        ],
        skippedTechnologies: ["Unknown Tech"],
      },
    );

    assert.deepEqual(matchPreferencesToApiInput(profile.preferences), {
      contribution_types: ["feature", "tests"],
      difficulty_levels: ["advanced"],
      project_sizes: ["large"],
      documentation_languages: ["any"],
      organization_types: ["company"],
      activity_window_days: 180,
      minimum_stars: 0,
      require_good_first_issue: false,
      require_help_wanted: false,
      default_sort_by: "best_match",
    });
  });

  await t.test("converts local app data into API import payload and skipped summary", () => {
    const conversion = localAppDataToApiImportInput(
      {
        profile: {
          name: "Ada Lovelace",
          role: "Full Stack Developer",
          seniority: "Senior",
          goal: "Build portfolio",
          technologies: [
            {
              name: "TypeScript",
              category: "Languages",
              level: "Daily use",
            },
            {
              name: "Unknown Tech",
              category: "Tools",
              level: "Basic",
            },
          ],
          preferences: {
            contributionTypes: ["Bug fix", "Documentation"],
            difficulty: "Beginner",
            projectSize: "Small",
            activityLevel: "Very active",
            preferredLanguage: "Any",
            organizationType: "Community",
          },
          completedOnboarding: true,
          updatedAt: "2026-07-05T12:00:00Z",
        },
        savedProjects: [
          {
            repositoryId: "123",
            status: "Working",
            savedAt: "2026-07-01T10:00:00Z",
            updatedAt: "2026-07-04T10:00:00Z",
          },
          {
            repositoryId: "owner/repo",
            status: "Saved",
            savedAt: "2026-07-01T10:00:00Z",
            updatedAt: "2026-07-04T10:00:00Z",
          },
        ],
        ignoredProjectIds: ["456", "not-a-number"],
        history: [
          {
            id: "history-1",
            type: "Opened GitHub",
            repositoryId: "123",
            createdAt: "2026-07-04T12:00:00Z",
          },
          {
            id: "history-2",
            type: "Viewed project",
            repositoryId: "owner/repo",
            createdAt: "2026-07-04T12:00:00Z",
          },
        ],
        theme: "system",
      },
      [
        {
          id: 10,
          slug: "typescript",
          name: "TypeScript",
          category: "language",
        },
      ],
    );

    assert.deepEqual(conversion.input.profile, {
      display_name: "Ada Lovelace",
      role: "Full Stack Developer",
      seniority: "senior",
      goals: ["build_portfolio"],
      onboarding_completed: true,
    });
    assert.deepEqual(conversion.input.technologies, [
      {
        technology_id: 10,
        proficiency_level: "daily",
        interest_level: "contribute",
      },
    ]);
    assert.deepEqual(conversion.input.repository_states, [
      {
        github_repository_id: 123,
        state: "working",
        notes: null,
      },
      {
        github_repository_id: 456,
        state: "ignored",
        notes: null,
      },
    ]);
    assert.deepEqual(conversion.input.history, [
      {
        event_type: "opened_github",
        github_repository_id: 123,
      },
    ]);
    assert.deepEqual(conversion.skipped, {
      technologies: ["Unknown Tech"],
      repositoryStates: ["owner/repo", "not-a-number"],
      history: ["history-2"],
    });
  });

  await t.test("adapts RepositorySummary into MatchedProject with safe fallbacks", () => {
    const repository: ApiRepositorySummary = {
      github_repository_id: 42,
      owner: "open-nova",
      name: "nova-ui",
      full_name: "open-nova/nova-ui",
      description: "Composable React components.",
      url: "https://github.com/open-nova/nova-ui",
      homepage_url: "https://nova-ui.example",
      primary_language: "TypeScript",
      languages: ["TypeScript", "React"],
      topics: ["react", "accessibility"],
      stars: 18420,
      forks: 1320,
      watchers: 420,
      open_issues: 112,
      contributors: 34,
      good_first_issues: 18,
      help_wanted_issues: 24,
      license: "MIT",
      last_updated_at: "2026-06-20",
      project_size: "large",
      activity_score: 97,
      activity_label: "very_active",
      health_score: 94,
    };

    const project = adaptApiRepositorySummaryToMatchedProject(repository, {
      match: {
        score: 96.4,
        recommended_seniority: "mid",
        shared_technologies: ["React", "TypeScript"],
        match_reasons: ["Strong overlap."],
        positives: ["Active maintainers"],
        challenges: ["Requires visual review"],
        health_checklist: [
          {
            key: "has_readme",
            label: "README found",
            passed: true,
          },
        ],
      },
    });

    assert.equal(project.id, "42");
    assert.equal(project.owner, "open-nova");
    assert.equal(project.repo, "nova-ui");
    assert.equal(project.name, "nova-ui");
    assert.equal(project.description, "Composable React components.");
    assert.equal(project.githubUrl, "https://github.com/open-nova/nova-ui");
    assert.equal(project.website, "https://nova-ui.example");
    assert.deepEqual(project.languages, ["TypeScript", "React"]);
    assert.equal(project.contributors, 34);
    assert.equal(project.size, "Large");
    assert.equal(project.activity, "Very active");
    assert.equal(project.healthScore, 94);
    assert.equal(project.matchScore, 96);
    assert.equal(project.recommendedLevel, "Mid-Level");
    assert.deepEqual(project.sharedTechnologies, ["React", "TypeScript"]);
    assert.deepEqual(project.matchReasons, ["Strong overlap."]);
    assert.deepEqual(project.healthChecklist, [
      { label: "README found", passed: true },
    ]);
    assert.deepEqual(project.issues, []);
  });

  await t.test("adapts RepositoryMatchItem and falls back to top-level match fields", () => {
    const item: ApiRepositoryMatchItem = {
      github_repository_id: 99,
      score: 88.8,
      recommended_seniority: "junior",
      match_reasons: ["Beginner-friendly labels."],
      shared_technologies: ["PHP"],
      positives: ["Good docs"],
      challenges: ["Large backlog"],
      cached: true,
      repository: {
        owner: "laravel-signal",
        name: "pulse-kit",
        full_name: "laravel-signal/pulse-kit",
        html_url: "https://github.com/laravel-signal/pulse-kit",
        project_size: "small",
        activity_label: "active",
      },
      match: {},
      user_state: null,
    };

    const project = adaptApiMatchToMatchedProject(item);

    assert.equal(project.id, "99");
    assert.equal(project.matchScore, 89);
    assert.equal(project.recommendedLevel, "Junior");
    assert.equal(project.activity, "High");
    assert.equal(project.size, "Small");
    assert.deepEqual(project.matchReasons, ["Beginner-friendly labels."]);
    assert.deepEqual(project.sharedTechnologies, ["PHP"]);
    assert.equal(project.githubUrl, "https://github.com/laravel-signal/pulse-kit");
  });

  await t.test("adapts top repository items without losing repository metrics", () => {
    const item: ApiTopRepositoryItem = {
      repository: {
        github_repository_id: 77,
        owner: "signal-kit",
        name: "runtime",
        full_name: "signal-kit/runtime",
        description: "Reactive runtime utilities.",
        stars: 5200,
        open_issues: 41,
        contributors: 18,
        primary_language: "TypeScript",
      },
      rank: 2,
      rank_metric: {
        type: "open_issues",
        value: 41,
      },
      user_state: "saved",
    };

    const project = adaptApiTopRepositoryItemToMatchedProject(item);

    assert.equal(project.id, "77");
    assert.equal(project.owner, "signal-kit");
    assert.equal(project.repo, "runtime");
    assert.equal(project.stars, 5200);
    assert.equal(project.openIssues, 41);
    assert.equal(project.contributors, 18);
    assert.deepEqual(project.languages, ["TypeScript"]);
  });

  await t.test("adapts RepositoryDetail with health and API issues", () => {
    const project = adaptApiRepositoryDetailToMatchedProject(
      {
        repository: {
          github_repository_id: 42,
          owner: "open-nova",
          name: "nova-ui",
          full_name: "open-nova/nova-ui",
          health_score: 83,
        },
        health: {
          score: 83,
          has_readme: true,
          has_contributing: false,
          has_code_of_conduct: true,
          has_ci: true,
          has_tests: false,
          has_contribution_labels: true,
        },
        user_state: "saved",
        match: {
          score: 91,
          recommended_seniority: "senior",
          reasons: ["Strong repository health."],
        },
      },
      [
        {
          github_issue_id: 321,
          title: "Add keyboard tests",
          labels: [{ name: "tests" }],
          difficulty: "medium",
          contribution_type: "test",
          confidence: 0.8,
        },
      ],
    );

    assert.equal(project.id, "42");
    assert.equal(project.matchScore, 91);
    assert.equal(project.recommendedLevel, "Senior");
    assert.deepEqual(project.matchReasons, ["Strong repository health."]);
    assert.deepEqual(project.healthChecklist, [
      { label: "README found", passed: true },
      { label: "CONTRIBUTING.md found", passed: false },
      { label: "CODE_OF_CONDUCT.md found", passed: true },
      { label: "CI/CD detected", passed: true },
      { label: "Tests detected", passed: false },
      { label: "Contribution labels found", passed: true },
    ]);
    assert.equal(project.issues.length, 1);
    assert.equal(project.issues[0]?.contributionType, "Tests");
  });

  await t.test("adapts RepositoryIssue into issue cards", () => {
    const issue: ApiRepositoryIssue = {
      github_issue_id: 321,
      title: "Improve keyboard focus ring",
      labels: [
        { name: "good first issue", color: "00ff00" },
        { name: "accessibility", color: null },
        {},
      ],
      comments: 6,
      created_at: "2026-06-12",
      difficulty: "easy",
      confidence: 0.94,
      contribution_type: "documentation",
      url: "https://github.com/open-nova/nova-ui/issues/321",
    };

    assert.deepEqual(adaptApiRepositoryIssue(issue), {
      id: "321",
      title: "Improve keyboard focus ring",
      labels: ["good first issue", "accessibility"],
      difficulty: "Easy",
      comments: 6,
      createdAt: "2026-06-12",
      matchScore: 94,
      contributionType: "Documentation",
      url: "https://github.com/open-nova/nova-ui/issues/321",
    });
  });

  await t.test("uses safe issue fallbacks for sparse DTOs", () => {
    const issue = adaptApiRepositoryIssue({
      github_repository_id: 42,
      title: null,
      difficulty: "unknown",
      difficulty_estimation: {
        level: "beginner",
        confidence: 0.3,
        reasons: [],
      },
    });

    assert.equal(issue.id, "42-issue");
    assert.equal(issue.title, "Untitled issue");
    assert.deepEqual(issue.labels, []);
    assert.equal(issue.difficulty, "Beginner");
    assert.equal(issue.comments, 0);
    assert.equal(issue.createdAt, "1970-01-01");
    assert.equal(issue.matchScore, 0);
    assert.equal(issue.contributionType, "Feature");
    assert.equal(issue.url, "");
  });

  await t.test("adapts user repository states into SavedProject", () => {
    const state: ApiUserRepositoryState = {
      github_repository_id: 42,
      state: "pull_request_sent",
      saved_at: "2026-07-01T10:00:00Z",
      updated_at: "2026-07-04T10:00:00Z",
    };

    assert.deepEqual(adaptApiUserRepositoryState(state), {
      repositoryId: "42",
      status: "Pull request sent",
      savedAt: "2026-07-01T10:00:00Z",
      updatedAt: "2026-07-04T10:00:00Z",
    });

    assert.equal(apiRepositoryStateToProjectStatus("ignored"), "Ignored");
    assert.equal(projectStatusToApiRepositoryState("Saved"), "saved");
    assert.equal(projectStatusToApiRepositoryState("Researching"), "researching");
    assert.equal(projectStatusToApiRepositoryState("Working"), "working");
    assert.equal(
      projectStatusToApiRepositoryState("Pull request sent"),
      "pull_request_sent",
    );
    assert.equal(projectStatusToApiRepositoryState("Contributed"), "contributed");
    assert.equal(projectStatusToApiRepositoryState("Archived"), "archived");
    assert.equal(projectStatusToApiRepositoryState("Ignored"), "ignored");
    assert.deepEqual(adaptApiRepositoryStates([state]).map((item) => item.status), [
      "Pull request sent",
    ]);
  });

  await t.test("adapts history events with repository and metadata", () => {
    const event: ApiHistoryEvent = {
      id: 77,
      github_repository_id: 42,
      event_type: "opened_github",
      repository: {
        owner: "open-nova",
        name: "nova-ui",
        full_name: "open-nova/nova-ui",
      },
      metadata: {
        issueId: 321,
        source: "card",
        useful: true,
        nested: { ignored: true },
      },
      created_at: "2026-07-04T12:00:00Z",
    };

    assert.deepEqual(adaptApiHistoryEvent(event), {
      id: "77",
      type: "Opened GitHub",
      repositoryId: "42",
      repositoryName: "open-nova/nova-ui",
      createdAt: "2026-07-04T12:00:00Z",
      metadata: {
        issueId: 321,
        source: "card",
        useful: true,
      },
    });
  });

  await t.test("maps API history event types to visual history labels", () => {
    assert.equal(
      adaptApiHistoryEvent({ event_type: "viewed_project" }).type,
      "Viewed project",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "saved_project" }).type,
      "Saved project",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "ignored_project" }).type,
      "Ignored project",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "opened_github" }).type,
      "Opened GitHub",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "started_contributing" }).type,
      "Marked as contributing",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "sent_pull_request" }).type,
      "Marked as contributing",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "marked_contributed" }).type,
      "Marked as contributed",
    );
    assert.equal(
      adaptApiHistoryEvent({ event_type: "restored_project" }).type,
      "Saved project",
    );
  });

  await t.test("uses safe repository and history fallbacks", () => {
    const project = adaptApiRepositorySummaryToMatchedProject({});
    assert.equal(project.id, "unknown-repository");
    assert.equal(project.owner, "unknown-owner");
    assert.equal(project.repo, "unknown-repository");
    assert.equal(project.description, "");
    assert.deepEqual(project.languages, []);
    assert.deepEqual(project.topics, []);
    assert.equal(project.githubUrl, "https://github.com/unknown-owner/unknown-repository");
    assert.equal(project.lastUpdated, "1970-01-01");

    const event = adaptApiHistoryEvent({});
    assert.equal(event.type, "Viewed project");
    assert.equal(event.createdAt, "1970-01-01");
    assert.equal(event.repositoryId, undefined);
    assert.equal(event.repositoryName, undefined);
    assert.equal(event.metadata, undefined);
  });

  await t.test("normalizes consent preferences and optional grant checks", () => {
    const consents = [
      {
        type: "analytics" as const,
        status: "granted" as const,
        policy_version: "2026-07-04",
        source: "settings" as const,
        created_at: "2026-07-04 12:00:00",
        revoked_at: null,
      },
      {
        type: "marketing" as const,
        status: "revoked" as const,
        policy_version: "2026-07-04",
        source: "settings" as const,
        created_at: "2026-07-04 12:00:00",
        revoked_at: "2026-07-04 13:00:00",
      },
    ];

    assert.equal(consentByType(consents).get("analytics")?.status, "granted");
    assert.equal(hasGrantedConsent(consents, "analytics"), true);
    assert.equal(hasGrantedConsent(consents, "marketing"), false);
    assert.equal(isOptionalConsent("analytics"), true);
    assert.equal(isOptionalConsent("essential"), false);
  });
});
