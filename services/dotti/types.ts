export type ApiCursor = string | number | null;

export type ApiPagination = {
  next_cursor?: ApiCursor;
};

export type ApiPaginatedResponse<TItem> = {
  items: TItem[];
  pagination: ApiPagination;
};

export type ApiRepositoryStateValue =
  | "saved"
  | "ignored"
  | "researching"
  | "working"
  | "pull_request_sent"
  | "contributed"
  | "archived";

export type ApiActivityEventType =
  | "viewed_project"
  | "saved_project"
  | "ignored_project"
  | "opened_github"
  | "started_contributing"
  | "sent_pull_request"
  | "marked_contributed"
  | "restored_project";

export type ApiRepositoryActivityEventType =
  | "viewed_project"
  | "opened_github"
  | "started_contributing"
  | "sent_pull_request"
  | "marked_contributed";

export type ApiSeniority = "junior" | "mid" | "senior";

export type ApiSortBy =
  | "score"
  | "best_match"
  | "most_active"
  | "most_stars"
  | "beginner_friendly"
  | "recently_updated";

export type ApiRepositorySummary = {
  github_repository_id?: number | null;
  owner?: string | null;
  name?: string | null;
  full_name?: string | null;
  description?: string | null;
  url?: string | null;
  homepage_url?: string | null;
  avatar_url?: string | null;
  primary_language?: string | null;
  languages?: string[];
  topics?: string[];
  stars?: number;
  forks?: number;
  watchers?: number;
  open_issues?: number;
  good_first_issues?: number;
  help_wanted_issues?: number;
  license?: string | null;
  last_pushed_at?: string | null;
  last_updated_at?: string | null;
  project_size?: "small" | "medium" | "large";
  activity_score?: number;
  activity_label?: "low" | "moderate" | "active" | "very_active";
  health_score?: number | null;
  html_url?: string | null;
  updated_at?: string | null;
  homepage?: string | null;
};

export type ApiMatchHealthChecklistItem = {
  key: string;
  label: string;
  passed: boolean;
};

export type ApiMatchBreakdown = {
  stack?: number;
  difficulty?: number;
  issues?: number;
  activity?: number;
  health?: number;
  contribution_readiness?: number;
};

export type ApiMatch = {
  github_repository_id?: number | null;
  score?: number;
  recommended_seniority?: ApiSeniority;
  breakdown?: ApiMatchBreakdown;
  reasons?: string[];
  match_reasons?: string[];
  shared_technologies?: string[];
  positives?: string[];
  challenges?: string[];
  health_checklist?: ApiMatchHealthChecklistItem[];
  generated_at?: string | null;
  expires_at?: string | null;
  cached?: boolean;
};

export type ApiRepositoryMatchItem = {
  github_repository_id?: number | null;
  score?: number;
  recommended_seniority?: ApiSeniority;
  match_reasons?: string[];
  shared_technologies?: string[];
  positives?: string[];
  challenges?: string[];
  health_checklist?: ApiMatchHealthChecklistItem[];
  generated_at?: string | null;
  expires_at?: string | null;
  cached?: boolean;
  repository: ApiRepositorySummary;
  match: ApiMatch;
  user_state: ApiRepositoryStateValue | null;
};

export type ApiRepositoryHealth = {
  score?: number;
  has_readme?: boolean;
  has_contributing?: boolean;
  has_code_of_conduct?: boolean;
  has_ci?: boolean;
  has_tests?: boolean;
  has_contribution_labels?: boolean;
};

export type ApiRepositoryDetail = {
  repository: ApiRepositorySummary;
  health: ApiRepositoryHealth | null;
  user_state: ApiRepositoryStateValue | null;
  match: ApiMatch | null;
};

export type ApiIssueDifficulty = {
  level?: "beginner" | "intermediate" | "advanced";
  confidence?: number;
  reasons?: string[];
};

export type ApiRepositoryIssue = {
  github_issue_id?: number | null;
  github_repository_id?: number | null;
  number?: number | null;
  title?: string | null;
  body_excerpt?: string | null;
  url?: string | null;
  state?: string;
  labels?: Array<{
    name?: string;
    color?: string | null;
  }>;
  comments?: number;
  created_at?: string | null;
  updated_at?: string | null;
  is_good_first_issue?: boolean;
  is_help_wanted?: boolean;
  difficulty?: "easy" | "medium" | "hard" | "unknown";
  confidence?: number | null;
  contribution_type?:
    | "bugfix"
    | "documentation"
    | "feature"
    | "test"
    | "refactor"
    | "unknown";
  issue_number?: number | null;
  difficulty_estimation?: ApiIssueDifficulty | null;
  fetched_at?: string | null;
  expires_at?: string | null;
  created_cache_at?: string | null;
  updated_cache_at?: string | null;
};

export type ApiUserRepositoryState = {
  id?: number;
  user_id?: number;
  github_repository_id: number;
  owner_login?: string;
  repository_name?: string;
  state: ApiRepositoryStateValue;
  notes?: string | null;
  saved_at?: string | null;
  ignored_at?: string | null;
  contributed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  repository?: ApiRepositorySummary | null;
};

export type ApiHistoryEvent = {
  id?: number;
  user_id?: number;
  github_repository_id?: number | null;
  type?: ApiActivityEventType;
  event_type?: ApiActivityEventType;
  metadata?: Record<string, unknown> | null;
  repository?: ApiRepositorySummary | null;
  created_at?: string;
};

export type ApiGitHubIntegrationStatus = {
  connected?: boolean;
  login?: string | null;
  provider?: string;
  scope?: string | null;
  token_last_verified_at?: string | null;
};

export type ApiConsentType =
  | "essential"
  | "analytics"
  | "sentry_replay"
  | "marketing"
  | "github_oauth_notice";

export type ApiConsentSource =
  | "cookie_banner"
  | "settings"
  | "login_notice"
  | "onboarding";

export type ApiConsentStatus = "granted" | "revoked";

export type ApiConsent = {
  type: ApiConsentType;
  status: ApiConsentStatus;
  policy_version: string;
  source: ApiConsentSource;
  created_at: string;
  revoked_at: string | null;
};
