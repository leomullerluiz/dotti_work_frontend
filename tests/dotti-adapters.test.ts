import assert from "node:assert/strict";
import test from "node:test";
import {
  adaptApiHistoryEvent,
  adaptApiMatchToMatchedProject,
  adaptApiRepositoryDetailToMatchedProject,
  adaptApiRepositoryIssue,
  adaptApiRepositoryStates,
  adaptApiRepositorySummaryToMatchedProject,
  adaptApiUserRepositoryState,
  apiRepositoryStateToProjectStatus,
} from "../services/dotti/adapters";
import type {
  ApiHistoryEvent,
  ApiRepositoryIssue,
  ApiRepositoryMatchItem,
  ApiRepositorySummary,
  ApiUserRepositoryState,
} from "../services/dotti/types";

test("dotti API adapters normalize backend DTOs into visual types", async (t) => {
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
});
