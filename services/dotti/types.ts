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

export type ApiTopRepositorySortBy = "stars" | "open_issues" | "contributors";

export type ApiTopRepositoryRankMetric = {
  type: ApiTopRepositorySortBy;
  value: number;
};

export type ApiTechnologyCategory =
  | "language"
  | "framework"
  | "library"
  | "tool"
  | "platform"
  | "database"
  | "devops_cloud";

export type ApiProficiencyLevel = "learning" | "basic" | "daily" | "advanced";

export type ApiInterestLevel = "learn" | "contribute" | "mentor";

export type ApiContributionType =
  | "bug_fix"
  | "feature"
  | "documentation"
  | "tests"
  | "performance"
  | "refactor"
  | "accessibility"
  | "translation";

export type ApiDifficultyLevel = "beginner" | "intermediate" | "advanced";

export type ApiProjectSize = "small" | "medium" | "large";

export type ApiDocumentationLanguage = "en" | "pt" | "es" | "any";

export type ApiOrganizationType =
  | "independent"
  | "startup"
  | "company"
  | "community"
  | "foundation"
  | "any";

export type ApiProfileGoal =
  | "first_contribution"
  | "build_portfolio"
  | "practical_experience"
  | "join_communities"
  | "long_term_projects";

export type ApiUser = {
  id?: number;
  login?: string | null;
  display_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  website_url?: string | null;
  github_profile_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiUserProfile = {
  id?: number;
  user_id?: number;
  role?: string | null;
  seniority?: ApiSeniority | null;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  goals?: ApiProfileGoal[];
  profile_frame?: ApiProfileFrame | null;
  created_at?: string;
  updated_at?: string;
};

export type ApiProfileUpdateInput = {
  display_name?: string | null;
  role?: string | null;
  seniority?: ApiSeniority | null;
  goals?: string[];
  onboarding_completed?: boolean;
};

export type ApiTechnology = {
  id: number;
  slug: string;
  name: string;
  category: ApiTechnologyCategory;
  github_language?: string | null;
  github_topics?: string[];
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type ApiUserTechnology = {
  technology_id: number;
  proficiency_level: ApiProficiencyLevel;
  interest_level?: ApiInterestLevel;
  id?: number;
  user_id?: number;
  slug?: string;
  name?: string;
  category?: ApiTechnologyCategory;
  github_language?: string | null;
  github_topics?: string[];
  created_at?: string;
  updated_at?: string;
};

export type ApiUserTechnologyInput = {
  technology_id: number;
  proficiency_level: ApiProficiencyLevel;
  interest_level?: ApiInterestLevel;
};

export type ApiUserPreferenceInput = {
  contribution_types: ApiContributionType[];
  difficulty_levels: ApiDifficultyLevel[];
  project_sizes: ApiProjectSize[];
  documentation_languages: ApiDocumentationLanguage[];
  organization_types: ApiOrganizationType[];
  activity_window_days?: number;
  minimum_stars?: number;
  require_good_first_issue?: boolean;
  require_help_wanted?: boolean;
  default_sort_by?: ApiSortBy;
};

export type ApiUserPreference = ApiUserPreferenceInput & {
  id?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
};

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
  contributors?: number;
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

export type ApiTopRepositoryItem = {
  repository: ApiRepositorySummary;
  rank: number;
  rank_metric: ApiTopRepositoryRankMetric;
  user_state: ApiRepositoryStateValue | null;
};

export type ApiTopRepositoryListMetadata = {
  sort_by: ApiTopRepositorySortBy;
  technology?: string | null;
  generated_at?: string | null;
  cached?: boolean;
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

export type ApiRepositoryStateImportInput = {
  github_repository_id: number;
  owner_login?: string;
  repository_name?: string;
  state: ApiRepositoryStateValue;
  notes?: string | null;
};

export type ApiActivityEventImportInput = {
  event_type: ApiActivityEventType;
  github_repository_id?: number | null;
};

export type ApiLocalDataImport = {
  profile?: ApiProfileUpdateInput;
  technologies?: ApiUserTechnologyInput[];
  preferences?: ApiUserPreferenceInput;
  repository_states?: ApiRepositoryStateImportInput[];
  history?: ApiActivityEventImportInput[];
};

export type ApiUserDataExport = {
  user: ApiUser;
  profile: ApiUserProfile;
  technologies: ApiUserTechnology[];
  preferences: ApiUserPreference;
  repository_states: ApiUserRepositoryState[];
  history: ApiHistoryEvent[];
  skipped?: Record<string, unknown>;
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

export type ApiBadge = {
  slug: string;
  name: string;
  description: string;
  category: string;
  level: string;
  image_url: string;
  image_alt: string;
  icon?: string | null;
  is_secret: boolean;
  display_order: number;
  criteria_type?: string;
  criteria_config?: Record<string, unknown>;
};

export type ApiUserBadge = {
  id: number;
  slug: string;
  awarded_at: string;
  notification_seen: boolean;
  notification_seen_at?: string | null;
  source_event_id?: number | null;
  progress_snapshot?: Record<string, unknown>;
  badge: ApiBadge;
};

export type ApiPublicProfileUser = {
  login?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  website_url?: string | null;
  github_profile_url?: string | null;
  role?: string | null;
  seniority?: ApiSeniority | null;
  goals?: ApiProfileGoal[];
  joined_at?: string | null;
  profile_frame?: ApiProfileFrame | null;
};

export type ApiProfileFrame = {
  slug: string;
  name: string;
  image_url: string | null;
  style_config: Record<string, unknown> | null;
  source_badge_slug: string | null;
  awarded_at: string | null;
};

export type ApiPublicGitHubProfile = {
  login: string | null;
  url: string | null;
  connected: boolean;
};

export type ApiPublicTechnology = {
  slug: string;
  name: string;
  category: ApiTechnologyCategory;
  proficiency_level: ApiProficiencyLevel;
  interest_level: ApiInterestLevel;
};

export type ApiPublicProfileMetrics = {
  technologies_count: number;
  badges_count: number;
  repositories_saved_count: number;
  repositories_contributed_count: number;
  pull_requests_sent_count: number;
  opened_github_count: number;
  activity_days_count: number;
  member_since: string | null;
  last_activity_at: string | null;
};

export type ApiPublicUserBadge = {
  slug: string;
  awarded_at: string | null;
  badge: ApiBadge;
};

export type ApiPublicFeaturedRepository = {
  github_repository_id: number | null;
  owner_login: string | null;
  repository_name: string | null;
  state: ApiRepositoryStateValue;
  public_url: string | null;
  updated_at: string | null;
  repository?: ApiRepositorySummary | null;
};

export type ApiPublicProfileShare = {
  canonical_url: string | null;
  api_url: string | null;
};

export type ApiPublicUserProfileData = {
  profile: ApiPublicProfileUser;
  github: ApiPublicGitHubProfile;
  technologies: ApiPublicTechnology[];
  metrics: ApiPublicProfileMetrics;
  badges: ApiPublicUserBadge[];
  featured_repositories: ApiPublicFeaturedRepository[];
  share: ApiPublicProfileShare;
};

export type ApiPublicProfileWarning = {
  code: string;
  message: string;
};

export type ApiPublicProfilePreview = {
  is_public: boolean;
  share_url: string | null;
  profile: ApiPublicUserProfileData;
  warnings?: ApiPublicProfileWarning[];
};

export type ApiPublicProfileSettings = {
  is_public: boolean;
  share_url: string | null;
  public_profile_slug: string | null;
};

export type ApiBadgeProgress = {
  slug: string;
  current_value: number;
  target_value: number;
  percent: number;
  completed: boolean;
  awarded_at?: string | null;
  criteria_type?: string;
  criteria_config?: Record<string, unknown>;
  badge: ApiBadge;
};

export type ApiMyBadges = {
  earned: ApiUserBadge[];
  progress: ApiBadgeProgress[];
  recently_awarded: ApiUserBadge[];
  unseen_awarded: ApiUserBadge[];
  unseen_awarded_count: number;
};
