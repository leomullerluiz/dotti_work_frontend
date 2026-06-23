export type SeniorityLevel = "Junior" | "Mid-Level" | "Senior";

export type SkillLevel = "Learning" | "Basic" | "Daily use" | "Advanced";

export type TechCategory =
  | "Languages"
  | "Frameworks"
  | "Libraries"
  | "Tools"
  | "Platforms"
  | "Databases"
  | "DevOps / Cloud";

export type ContributionType =
  | "Bug fix"
  | "Feature"
  | "Documentation"
  | "Tests"
  | "Performance"
  | "Refactoring"
  | "Accessibility"
  | "Translation";

export type DifficultyLevel = "Beginner" | "Easy" | "Medium" | "Hard";

export type ProjectSize = "Small" | "Medium" | "Large" | "Any";

export type ActivityLevel = "Low" | "Moderate" | "High" | "Very active";

export type OrganizationType =
  | "Any"
  | "Community"
  | "Company-backed"
  | "Foundation"
  | "Solo maintainer";

export type ProjectStatus =
  | "Saved"
  | "Researching"
  | "Working"
  | "Pull request sent"
  | "Contributed"
  | "Archived";

export type HistoryEventType =
  | "Viewed project"
  | "Saved project"
  | "Ignored project"
  | "Opened GitHub"
  | "Marked as contributing"
  | "Marked as contributed";

export type ThemeMode = "light" | "dark" | "system";

export type SortOption =
  | "Best match"
  | "Most active"
  | "Most stars"
  | "Most beginner friendly"
  | "Recently updated";

export type TechnologyFilter = {
  query: string;
  technologies: string[];
  difficulty: "All" | DifficultyLevel;
  projectSize: "All" | ProjectSize;
  activity: "All" | ActivityLevel;
  hasGoodFirstIssue: boolean;
  hasHelpWanted: boolean;
  minimumStars: number;
  language: "All" | string;
  healthScore: number;
  sortBy: SortOption;
};

export type UserTechnology = {
  name: string;
  category: TechCategory;
  level: SkillLevel;
};

export type MatchPreferences = {
  contributionTypes: ContributionType[];
  difficulty: DifficultyLevel;
  projectSize: ProjectSize;
  activityLevel: ActivityLevel;
  preferredLanguage: string;
  organizationType: OrganizationType;
};

export type DeveloperProfile = {
  name?: string;
  role: string;
  seniority: SeniorityLevel;
  goal: string;
  technologies: UserTechnology[];
  preferences: MatchPreferences;
  completedOnboarding: boolean;
  updatedAt: string;
};

export type RepositoryIssue = {
  id: string;
  title: string;
  labels: string[];
  difficulty: DifficultyLevel;
  comments: number;
  createdAt: string;
  matchScore: number;
  contributionType: ContributionType;
  url: string;
};

export type HealthChecklistItem = {
  label: string;
  passed: boolean;
};

export type Repository = {
  id: string;
  owner: string;
  repo: string;
  name: string;
  description: string;
  avatarColor: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  goodFirstIssues: number;
  helpWantedIssues: number;
  topics: string[];
  languages: string[];
  size: Exclude<ProjectSize, "Any">;
  activity: ActivityLevel;
  healthScore: number;
  activityScore: number;
  lastUpdated: string;
  difficulty: DifficultyLevel;
  recommendedLevel: SeniorityLevel;
  license: string;
  website?: string;
  githubUrl: string;
};

export type MatchedProject = Repository & {
  matchScore: number;
  sharedTechnologies: string[];
  matchReasons: string[];
  positives: string[];
  challenges: string[];
  healthChecklist: HealthChecklistItem[];
  issues: RepositoryIssue[];
};

export type SavedProject = {
  repositoryId: string;
  status: ProjectStatus;
  savedAt: string;
  updatedAt: string;
};

export type HistoryEvent = {
  id: string;
  type: HistoryEventType;
  repositoryId?: string;
  repositoryName?: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
};

export type LocalAppData = {
  profile: DeveloperProfile | null;
  savedProjects: SavedProject[];
  ignoredProjectIds: string[];
  history: HistoryEvent[];
  theme: ThemeMode;
};
