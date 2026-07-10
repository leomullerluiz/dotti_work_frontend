import type {
  ActivityLevel,
  ContributionType,
  DeveloperProfile,
  DifficultyLevel,
  HistoryEvent,
  HistoryEventType,
  MatchedProject,
  MatchPreferences,
  OrganizationType,
  ProjectStatus,
  ProjectSize,
  RepositoryIssue,
  SavedProject,
  SeniorityLevel,
  SkillLevel,
  TechCategory,
  UserTechnology,
  LocalAppData,
} from "@/types";
import type {
  ApiActivityEventType,
  ApiContributionType,
  ApiDifficultyLevel,
  ApiHistoryEvent,
  ApiMatch,
  ApiOrganizationType,
  ApiProfileGoal,
  ApiProfileUpdateInput,
  ApiProficiencyLevel,
  ApiProjectSize,
  ApiActivityEventImportInput,
  ApiLocalDataImport,
  ApiRepositoryStateImportInput,
  ApiRepositoryDetail,
  ApiRepositoryHealth,
  ApiRepositoryIssue,
  ApiRepositoryMatchItem,
  ApiRepositoryStateValue,
  ApiRepositorySummary,
  ApiTechnology,
  ApiTopRepositoryItem,
  ApiTechnologyCategory,
  ApiUser,
  ApiUserPreference,
  ApiUserPreferenceInput,
  ApiUserProfile,
  ApiUserTechnology,
  ApiUserTechnologyInput,
  ApiUserRepositoryState,
} from "./types";

type MatchedProjectOptions = {
  match?: ApiMatch | null;
  health?: ApiRepositoryHealth | null;
  issues?: ApiRepositoryIssue[];
};

const fallbackDate = "1970-01-01";

const avatarGradients = [
  "from-coral-400 to-rose-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-400 to-pink-500",
  "from-cyan-400 to-blue-500",
] as const;

const repositoryStateToProjectStatus: Record<
  ApiRepositoryStateValue,
  ProjectStatus
> = {
  saved: "Saved",
  ignored: "Ignored",
  researching: "Researching",
  working: "Working",
  pull_request_sent: "Pull request sent",
  contributed: "Contributed",
  archived: "Archived",
};

const activityEventToHistoryEvent: Record<ApiActivityEventType, HistoryEventType> = {
  viewed_project: "Viewed project",
  saved_project: "Saved project",
  ignored_project: "Ignored project",
  opened_github: "Opened GitHub",
  started_contributing: "Marked as contributing",
  sent_pull_request: "Marked as contributing",
  marked_contributed: "Marked as contributed",
  restored_project: "Saved project",
};

const historyEventToApi: Partial<Record<HistoryEventType, ApiActivityEventType>> = {
  "Viewed project": "viewed_project",
  "Saved project": "saved_project",
  "Ignored project": "ignored_project",
  "Opened GitHub": "opened_github",
  "Marked as contributing": "started_contributing",
  "Marked as contributed": "marked_contributed",
};

const defaultPreferences: MatchPreferences = {
  contributionTypes: ["Bug fix", "Documentation"],
  difficulty: "Easy",
  projectSize: "Any",
  activityLevel: "High",
  preferredLanguage: "Any",
  organizationType: "Any",
};

const seniorityToVisual: Record<"junior" | "mid" | "senior", SeniorityLevel> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
};

const seniorityToApi: Record<SeniorityLevel, "junior" | "mid" | "senior"> = {
  Junior: "junior",
  "Mid-Level": "mid",
  Senior: "senior",
};

const profileGoalToVisual: Record<ApiProfileGoal, string> = {
  first_contribution: "Make my first contribution",
  build_portfolio: "Build portfolio",
  practical_experience: "Gain practical experience",
  join_communities: "Join open source communities",
  long_term_projects: "Find long-term projects",
};

const profileGoalToApi: Record<string, ApiProfileGoal> = {
  "Make my first contribution": "first_contribution",
  "Build portfolio": "build_portfolio",
  "Gain practical experience": "practical_experience",
  "Join open source communities": "join_communities",
  "Find long-term projects": "long_term_projects",
};

const techCategoryToVisual: Record<ApiTechnologyCategory, TechCategory> = {
  language: "Languages",
  framework: "Frameworks",
  library: "Libraries",
  tool: "Tools",
  platform: "Platforms",
  database: "Databases",
  devops_cloud: "DevOps / Cloud",
};

const proficiencyToVisual: Record<ApiProficiencyLevel, SkillLevel> = {
  learning: "Learning",
  basic: "Basic",
  daily: "Daily use",
  advanced: "Advanced",
};

const proficiencyToApi: Record<SkillLevel, ApiProficiencyLevel> = {
  Learning: "learning",
  Basic: "basic",
  "Daily use": "daily",
  Advanced: "advanced",
};

const contributionTypeToVisual: Record<ApiContributionType, ContributionType> = {
  bug_fix: "Bug fix",
  feature: "Feature",
  documentation: "Documentation",
  tests: "Tests",
  performance: "Performance",
  refactor: "Refactoring",
  accessibility: "Accessibility",
  translation: "Translation",
};

const contributionTypeToApi: Record<ContributionType, ApiContributionType> = {
  "Bug fix": "bug_fix",
  Feature: "feature",
  Documentation: "documentation",
  Tests: "tests",
  Performance: "performance",
  Refactoring: "refactor",
  Accessibility: "accessibility",
  Translation: "translation",
};

export function adaptApiRepositorySummaryToMatchedProject(
  repository: ApiRepositorySummary,
  options: MatchedProjectOptions = {},
): MatchedProject {
  const owner = repository.owner ?? parseOwner(repository.full_name) ?? "unknown-owner";
  const repo =
    repository.name ?? parseRepo(repository.full_name) ?? "unknown-repository";
  const match = options.match;
  const key = repository.full_name ?? `${owner}/${repo}`;

  return {
    id: repositoryId(repository),
    owner,
    repo,
    name: repository.name ?? repository.full_name ?? repo,
    description: repository.description ?? "",
    avatarColor: avatarGradient(key),
    stars: repository.stars ?? 0,
    forks: repository.forks ?? 0,
    watchers: repository.watchers ?? 0,
    openIssues: repository.open_issues ?? 0,
    contributors: repository.contributors ?? 0,
    goodFirstIssues: repository.good_first_issues ?? 0,
    helpWantedIssues: repository.help_wanted_issues ?? 0,
    topics: repository.topics ?? [],
    languages: repositoryLanguages(repository),
    size: mapProjectSize(repository.project_size),
    activity: mapActivity(repository.activity_label),
    healthScore: repository.health_score ?? 0,
    activityScore: repository.activity_score ?? 0,
    lastUpdated:
      repository.last_updated_at ??
      repository.updated_at ??
      repository.last_pushed_at ??
      fallbackDate,
    difficulty: "Medium",
    recommendedLevel: mapSeniority(match?.recommended_seniority),
    license: repository.license ?? "Unknown",
    website: repository.homepage_url ?? repository.homepage ?? undefined,
    githubUrl:
      repository.url ??
      repository.html_url ??
      `https://github.com/${owner}/${repo}`,
    matchScore: Math.round(match?.score ?? 0),
    sharedTechnologies: match?.shared_technologies ?? [],
    matchReasons: match?.match_reasons ?? match?.reasons ?? [],
    positives: match?.positives ?? [],
    challenges: match?.challenges ?? [],
    healthChecklist: healthChecklist(match, options.health),
    issues: (options.issues ?? []).map(adaptApiRepositoryIssue),
  };
}

export function adaptApiRepositoryDetailToMatchedProject(
  detail: ApiRepositoryDetail,
  issues: ApiRepositoryIssue[] = [],
): MatchedProject {
  return adaptApiRepositorySummaryToMatchedProject(detail.repository, {
    match: detail.match,
    health: detail.health,
    issues,
  });
}

export function adaptApiMatchToMatchedProject(
  item: ApiRepositoryMatchItem,
): MatchedProject {
  return adaptApiRepositorySummaryToMatchedProject({
    ...item.repository,
    github_repository_id:
      item.repository.github_repository_id ?? item.github_repository_id,
  }, {
    match: mergeMatchFields(item),
  });
}

export function adaptApiTopRepositoryItemToMatchedProject(
  item: ApiTopRepositoryItem,
): MatchedProject {
  return adaptApiRepositorySummaryToMatchedProject(item.repository);
}

export function adaptApiRepositoryIssue(
  issue: ApiRepositoryIssue,
): RepositoryIssue {
  return {
    id: issueId(issue),
    title: issue.title ?? "Untitled issue",
    labels: issue.labels?.map((label) => label.name).filter(isString) ?? [],
    difficulty: mapIssueDifficulty(issue),
    comments: issue.comments ?? 0,
    createdAt:
      issue.created_at ??
      issue.updated_at ??
      issue.fetched_at ??
      issue.created_cache_at ??
      fallbackDate,
    matchScore: Math.round((issue.confidence ?? 0) * 100),
    contributionType: mapContributionType(issue.contribution_type),
    url: issue.url ?? "",
  };
}

export function adaptApiUserRepositoryState(
  state: ApiUserRepositoryState,
): SavedProject {
  const updatedAt = state.updated_at ?? state.created_at ?? fallbackDate;

  return {
    repositoryId: String(state.github_repository_id),
    status: repositoryStateToProjectStatus[state.state],
    savedAt:
      state.saved_at ??
      state.ignored_at ??
      state.contributed_at ??
      state.created_at ??
      updatedAt,
    updatedAt,
  };
}

export function adaptApiHistoryEvent(event: ApiHistoryEvent): HistoryEvent {
  const eventType = event.event_type ?? event.type;
  const repositoryName =
    event.repository?.full_name ??
    joinRepositoryName(event.repository?.owner, event.repository?.name);

  return {
    id: String(event.id ?? `${eventType ?? "event"}-${event.created_at ?? fallbackDate}`),
    type: eventType
      ? activityEventToHistoryEvent[eventType]
      : "Viewed project",
    repositoryId:
      event.github_repository_id !== null && event.github_repository_id !== undefined
        ? String(event.github_repository_id)
        : event.repository
          ? repositoryId(event.repository)
          : undefined,
    repositoryName,
    createdAt: event.created_at ?? fallbackDate,
    metadata: sanitizeMetadata(event.metadata),
  };
}

export function adaptApiRepositoryStates(
  states: ApiUserRepositoryState[],
): SavedProject[] {
  return states.map(adaptApiUserRepositoryState);
}

export function adaptApiHistoryEvents(events: ApiHistoryEvent[]): HistoryEvent[] {
  return events.map(adaptApiHistoryEvent);
}

export function adaptApiProfileToDeveloperProfile({
  user,
  profile,
  technologies = [],
  preferences,
}: {
  user?: ApiUser | null;
  profile?: ApiUserProfile | null;
  technologies?: ApiUserTechnology[];
  preferences?: ApiUserPreference | null;
}): DeveloperProfile | null {
  if (!profile && technologies.length === 0 && !preferences) {
    return null;
  }

  return {
    name: user?.display_name ?? user?.login ?? undefined,
    role: profile?.role ?? "",
    seniority: profile?.seniority
      ? seniorityToVisual[profile.seniority]
      : "Junior",
    goal: profile?.goals?.[0]
      ? profileGoalToVisual[profile.goals[0]]
      : "",
    technologies: technologies.map(adaptApiUserTechnology),
    preferences: adaptApiUserPreference(preferences),
    completedOnboarding: Boolean(profile?.onboarding_completed),
    updatedAt:
      profile?.updated_at ??
      user?.updated_at ??
      user?.created_at ??
      fallbackDate,
  };
}

export function adaptApiTechnologyToUserTechnology(
  technology: ApiTechnology,
): UserTechnology {
  return {
    name: technology.name,
    category: techCategoryToVisual[technology.category],
    level: "Basic",
  };
}

export function developerProfileToApiProfileInput(
  profile: DeveloperProfile,
): ApiProfileUpdateInput {
  return {
    display_name: profile.name?.trim() || null,
    role: profile.role || null,
    seniority: seniorityToApi[profile.seniority],
    goals: profile.goal ? [profileGoalToApi[profile.goal] ?? profile.goal] : [],
    onboarding_completed: profile.completedOnboarding,
  };
}

export function developerProfileToApiTechnologyInputs(
  profile: DeveloperProfile,
  catalog: ApiTechnology[],
) {
  const technologies: ApiUserTechnologyInput[] = [];
  const skippedTechnologies: string[] = [];
  const catalogByName = new Map(
    catalog.map((technology) => [technology.name.toLowerCase(), technology]),
  );

  profile.technologies.slice(0, 50).forEach((technology) => {
    const apiTechnology = catalogByName.get(technology.name.toLowerCase());

    if (!apiTechnology) {
      skippedTechnologies.push(technology.name);
      return;
    }

    technologies.push({
      technology_id: apiTechnology.id,
      proficiency_level: proficiencyToApi[technology.level],
      interest_level: "contribute",
    });
  });

  return {
    technologies,
    skippedTechnologies,
  };
}

export function matchPreferencesToApiInput(
  preferences: MatchPreferences,
): ApiUserPreferenceInput {
  return {
    contribution_types: preferences.contributionTypes.map(
      (type) => contributionTypeToApi[type],
    ),
    difficulty_levels: [visualDifficultyToApi(preferences.difficulty)],
    project_sizes: visualProjectSizeToApi(preferences.projectSize),
    documentation_languages: [
      preferences.preferredLanguage === "Any" ? "any" : "en",
    ],
    organization_types: visualOrganizationToApi(preferences.organizationType),
    activity_window_days: visualActivityToDays(preferences.activityLevel),
    minimum_stars: 0,
    require_good_first_issue: preferences.difficulty === "Beginner",
    require_help_wanted: false,
    default_sort_by: "best_match",
  };
}

export function apiRepositoryStateToProjectStatus(
  state: ApiRepositoryStateValue,
): ProjectStatus {
  return repositoryStateToProjectStatus[state];
}

export function projectStatusToApiRepositoryState(
  status: ProjectStatus,
): ApiRepositoryStateValue {
  switch (status) {
    case "Saved":
      return "saved";
    case "Researching":
      return "researching";
    case "Working":
      return "working";
    case "Pull request sent":
      return "pull_request_sent";
    case "Contributed":
      return "contributed";
    case "Archived":
      return "archived";
    case "Ignored":
      return "ignored";
  }
}

export type LocalDataImportConversion = {
  input: ApiLocalDataImport;
  skipped: {
    technologies: string[];
    repositoryStates: string[];
    history: string[];
  };
};

export function localAppDataToApiImportInput(
  data: LocalAppData,
  catalog: ApiTechnology[],
): LocalDataImportConversion {
  const skipped = {
    technologies: [] as string[],
    repositoryStates: [] as string[],
    history: [] as string[],
  };
  const repositoryStates = new Map<number, ApiRepositoryStateImportInput>();

  data.savedProjects.forEach((savedProject) => {
    const githubRepositoryId = parseGitHubRepositoryId(savedProject.repositoryId);

    if (githubRepositoryId === null) {
      skipped.repositoryStates.push(savedProject.repositoryId);
      return;
    }

    repositoryStates.set(githubRepositoryId, {
      github_repository_id: githubRepositoryId,
      state: projectStatusToApiRepositoryState(savedProject.status),
      notes: null,
    });
  });

  data.ignoredProjectIds.forEach((repositoryId) => {
    const githubRepositoryId = parseGitHubRepositoryId(repositoryId);

    if (githubRepositoryId === null) {
      skipped.repositoryStates.push(repositoryId);
      return;
    }

    repositoryStates.set(githubRepositoryId, {
      github_repository_id: githubRepositoryId,
      state: "ignored",
      notes: null,
    });
  });

  const history = data.history.reduce<ApiActivityEventImportInput[]>(
    (items, event) => {
      const eventType = historyEventToApi[event.type];

      if (!eventType) {
        skipped.history.push(event.id);
        return items;
      }

      const githubRepositoryId = event.repositoryId
        ? parseGitHubRepositoryId(event.repositoryId)
        : null;

      if (event.repositoryId && githubRepositoryId === null) {
        skipped.history.push(event.id);
        return items;
      }

      items.push({
        event_type: eventType,
        github_repository_id: githubRepositoryId,
      });
      return items;
    },
    [],
  );

  const input: ApiLocalDataImport = {
    repository_states: Array.from(repositoryStates.values()).slice(0, 200),
    history: history.slice(0, 300),
  };

  if (data.profile) {
    const { technologies, skippedTechnologies } =
      developerProfileToApiTechnologyInputs(data.profile, catalog);

    input.profile = developerProfileToApiProfileInput(data.profile);
    input.technologies = technologies;
    input.preferences = matchPreferencesToApiInput(data.profile.preferences);
    skipped.technologies = skippedTechnologies;
  }

  return { input, skipped };
}

export function adaptApiUserRepositoryStateToMatchedProject(
  state: ApiUserRepositoryState,
): MatchedProject | null {
  if (!state.repository) {
    return null;
  }

  return adaptApiRepositorySummaryToMatchedProject(state.repository);
}

function parseGitHubRepositoryId(value: string) {
  const normalized = Number(value);
  if (!Number.isSafeInteger(normalized) || normalized <= 0) {
    return null;
  }

  return normalized;
}

function mergeMatchFields(item: ApiRepositoryMatchItem): ApiMatch {
  return {
    ...item.match,
    github_repository_id:
      item.match.github_repository_id ?? item.github_repository_id,
    score: item.match.score ?? item.score,
    recommended_seniority:
      item.match.recommended_seniority ?? item.recommended_seniority,
    match_reasons: item.match.match_reasons ?? item.match_reasons,
    shared_technologies:
      item.match.shared_technologies ?? item.shared_technologies,
    positives: item.match.positives ?? item.positives,
    challenges: item.match.challenges ?? item.challenges,
    health_checklist: item.match.health_checklist ?? item.health_checklist,
    generated_at: item.match.generated_at ?? item.generated_at,
    expires_at: item.match.expires_at ?? item.expires_at,
    cached: item.match.cached ?? item.cached,
  };
}

function repositoryId(repository: ApiRepositorySummary) {
  return String(
    repository.github_repository_id ??
      repository.full_name ??
      joinRepositoryName(repository.owner, repository.name) ??
      repository.name ??
      "unknown-repository",
  );
}

function issueId(issue: ApiRepositoryIssue) {
  return String(
    issue.github_issue_id ??
      issue.number ??
      issue.issue_number ??
      `${issue.github_repository_id ?? "repository"}-${issue.title ?? "issue"}`,
  );
}

function repositoryLanguages(repository: ApiRepositorySummary) {
  return unique([
    ...(repository.primary_language ? [repository.primary_language] : []),
    ...(repository.languages ?? []),
  ]);
}

function mapProjectSize(value: ApiRepositorySummary["project_size"]) {
  if (value === "small") {
    return "Small";
  }
  if (value === "large") {
    return "Large";
  }
  return "Medium";
}

function mapActivity(value: ApiRepositorySummary["activity_label"]) {
  if (value === "low") {
    return "Low";
  }
  if (value === "active") {
    return "High";
  }
  if (value === "very_active") {
    return "Very active";
  }
  return "Moderate";
}

function mapSeniority(value: ApiMatch["recommended_seniority"]) {
  if (value === "junior") {
    return "Junior";
  }
  if (value === "senior") {
    return "Senior";
  }
  return "Mid-Level";
}

function mapIssueDifficulty(issue: ApiRepositoryIssue): DifficultyLevel {
  if (issue.difficulty === "easy") {
    return "Easy";
  }
  if (issue.difficulty === "hard") {
    return "Hard";
  }
  if (issue.difficulty === "medium") {
    return "Medium";
  }

  if (issue.difficulty_estimation?.level === "beginner") {
    return "Beginner";
  }
  if (issue.difficulty_estimation?.level === "advanced") {
    return "Hard";
  }
  return "Medium";
}

function mapContributionType(
  value: ApiRepositoryIssue["contribution_type"],
): ContributionType {
  if (value === "bugfix") {
    return "Bug fix";
  }
  if (value === "documentation") {
    return "Documentation";
  }
  if (value === "test") {
    return "Tests";
  }
  if (value === "refactor") {
    return "Refactoring";
  }
  return "Feature";
}

function adaptApiUserTechnology(technology: ApiUserTechnology): UserTechnology {
  return {
    name: technology.name ?? `Technology #${technology.technology_id}`,
    category: technology.category
      ? techCategoryToVisual[technology.category]
      : "Tools",
    level: proficiencyToVisual[technology.proficiency_level],
  };
}

function adaptApiUserPreference(
  preferences: ApiUserPreference | null | undefined,
): MatchPreferences {
  if (!preferences) {
    return defaultPreferences;
  }

  return {
    contributionTypes:
      preferences.contribution_types?.map(
        (type) => contributionTypeToVisual[type],
      ) ?? defaultPreferences.contributionTypes,
    difficulty: apiDifficultyToVisual(preferences.difficulty_levels?.[0]),
    projectSize: apiProjectSizeToVisual(preferences.project_sizes?.[0]),
    activityLevel: apiActivityDaysToVisual(preferences.activity_window_days),
    preferredLanguage:
      preferences.documentation_languages?.[0] === "any"
        ? "Any"
        : preferences.documentation_languages?.[0]?.toUpperCase() ?? "Any",
    organizationType: apiOrganizationToVisual(preferences.organization_types?.[0]),
  };
}

function apiDifficultyToVisual(
  value: ApiDifficultyLevel | undefined,
): DifficultyLevel {
  if (value === "beginner") {
    return "Beginner";
  }
  if (value === "advanced") {
    return "Hard";
  }
  return "Medium";
}

function visualDifficultyToApi(value: DifficultyLevel): ApiDifficultyLevel {
  if (value === "Beginner" || value === "Easy") {
    return "beginner";
  }
  if (value === "Hard") {
    return "advanced";
  }
  return "intermediate";
}

function apiProjectSizeToVisual(
  value: ApiProjectSize | undefined,
): ProjectSize {
  if (value === "small") {
    return "Small";
  }
  if (value === "medium") {
    return "Medium";
  }
  if (value === "large") {
    return "Large";
  }
  return "Any";
}

function visualProjectSizeToApi(value: ProjectSize): ApiProjectSize[] {
  if (value === "Small") {
    return ["small"];
  }
  if (value === "Medium") {
    return ["medium"];
  }
  if (value === "Large") {
    return ["large"];
  }
  return ["small", "medium", "large"];
}

function apiActivityDaysToVisual(days: number | undefined): ActivityLevel {
  if (!days || days <= 30) {
    return "Very active";
  }
  if (days <= 90) {
    return "High";
  }
  if (days <= 180) {
    return "Moderate";
  }
  return "Low";
}

function visualActivityToDays(value: ActivityLevel) {
  if (value === "Very active") {
    return 30;
  }
  if (value === "High") {
    return 90;
  }
  if (value === "Moderate") {
    return 180;
  }
  return 365;
}

function apiOrganizationToVisual(
  value: ApiOrganizationType | undefined,
): OrganizationType {
  if (value === "community") {
    return "Community";
  }
  if (value === "company" || value === "startup") {
    return "Company-backed";
  }
  if (value === "foundation") {
    return "Foundation";
  }
  if (value === "independent") {
    return "Solo maintainer";
  }
  return "Any";
}

function visualOrganizationToApi(value: OrganizationType): ApiOrganizationType[] {
  if (value === "Community") {
    return ["community"];
  }
  if (value === "Company-backed") {
    return ["company"];
  }
  if (value === "Foundation") {
    return ["foundation"];
  }
  if (value === "Solo maintainer") {
    return ["independent"];
  }
  return ["any"];
}

function healthChecklist(
  match: ApiMatch | null | undefined,
  health: ApiRepositoryHealth | null | undefined,
) {
  const matchChecklist = match?.health_checklist?.map((item) => ({
    label: item.label,
    passed: item.passed,
  }));

  if (matchChecklist && matchChecklist.length > 0) {
    return matchChecklist;
  }

  if (!health) {
    return [];
  }

  return [
    { label: "README found", passed: Boolean(health.has_readme) },
    { label: "CONTRIBUTING.md found", passed: Boolean(health.has_contributing) },
    {
      label: "CODE_OF_CONDUCT.md found",
      passed: Boolean(health.has_code_of_conduct),
    },
    { label: "CI/CD detected", passed: Boolean(health.has_ci) },
    { label: "Tests detected", passed: Boolean(health.has_tests) },
    {
      label: "Contribution labels found",
      passed: Boolean(health.has_contribution_labels),
    },
  ];
}

function avatarGradient(value: string) {
  const hash = Array.from(value).reduce(
    (current, char) => current + char.charCodeAt(0),
    0,
  );
  return avatarGradients[hash % avatarGradients.length];
}

function parseOwner(fullName: string | null | undefined) {
  return fullName?.split("/")[0] || null;
}

function parseRepo(fullName: string | null | undefined) {
  return fullName?.split("/")[1] || null;
}

function joinRepositoryName(
  owner: string | null | undefined,
  repo: string | null | undefined,
) {
  if (!owner || !repo) {
    return undefined;
  }
  return `${owner}/${repo}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sanitizeMetadata(metadata: ApiHistoryEvent["metadata"]) {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata).filter(
    (entry): entry is [string, string | number | boolean] =>
      ["string", "number", "boolean"].includes(typeof entry[1]),
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}
