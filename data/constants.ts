import type {
  ActivityLevel,
  ContributionType,
  DifficultyLevel,
  MatchPreferences,
  ProjectSize,
  ProjectStatus,
  SortOption,
  TechCategory,
  TechnologyFilter,
} from "@/types";

export const STORAGE_KEYS = {
  profile: "dotti.profile",
  savedProjects: "dotti.savedProjects",
  ignoredProjects: "dotti.ignoredProjects",
  history: "dotti.history",
  theme: "dotti.theme",
  filters: "dotti.filters",
  pendingOnboarding: "dotti.pendingOnboarding",
  consent: "dotti.consent",
} as const;

export const PROFESSIONAL_ROLES = [
  "Front-end Developer",
  "Back-end Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "QA Engineer",
  "UI/UX Designer",
  "Other",
] as const;

export const SENIORITY_LEVELS = ["Junior", "Mid-Level", "Senior"] as const;

export const PROFILE_GOALS = [
  "Make my first contribution",
  "Build portfolio",
  "Gain practical experience",
  "Join open source communities",
  "Find long-term projects",
] as const;

export const CONTRIBUTION_TYPES: ContributionType[] = [
  "Bug fix",
  "Feature",
  "Documentation",
  "Tests",
  "Performance",
  "Refactoring",
  "Accessibility",
  "Translation",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "Beginner",
  "Easy",
  "Medium",
  "Hard",
];

export const PROJECT_SIZES: ProjectSize[] = ["Any", "Small", "Medium", "Large"];

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "Low",
  "Moderate",
  "High",
  "Very active",
];

export const ORGANIZATION_TYPES = [
  "Any",
  "Community",
  "Company-backed",
  "Foundation",
  "Solo maintainer",
] as const;

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Saved",
  "Researching",
  "Working",
  "Pull request sent",
  "Contributed",
  "Archived",
];

export const SORT_OPTIONS: SortOption[] = [
  "Best match",
  "Most active",
  "Most stars",
  "Most beginner friendly",
  "Recently updated",
];

export const TECHNOLOGY_CATALOG: Record<TechCategory, string[]> = {
  Languages: [
    "TypeScript",
    "JavaScript",
    "PHP",
    "Python",
    "Java",
    "Go",
    "Ruby",
  ],
  Frameworks: [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Laravel",
    "Express",
    "FastAPI",
  ],
  Libraries: [
    "TailwindCSS",
    "React Query",
    "Redux",
    "Zod",
    "Vitest",
    "Jest",
    "Testing Library",
  ],
  Tools: [
    "Git",
    "GitHub Actions",
    "ESLint",
    "Prettier",
    "Storybook",
    "Playwright",
  ],
  Platforms: ["GitHub", "WordPress", "Firebase", "Vercel", "Netlify"],
  Databases: ["MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis"],
  "DevOps / Cloud": ["Docker", "AWS", "GCP", "Azure", "Kubernetes"],
};

export const DEFAULT_PREFERENCES: MatchPreferences = {
  contributionTypes: ["Bug fix", "Documentation"],
  difficulty: "Easy",
  projectSize: "Any",
  activityLevel: "High",
  preferredLanguage: "TypeScript",
  organizationType: "Any",
};

export const DEFAULT_FILTERS: TechnologyFilter = {
  query: "",
  technologies: [],
  difficulty: "All",
  projectSize: "All",
  activity: "All",
  hasGoodFirstIssue: false,
  hasHelpWanted: false,
  minimumStars: 0,
  language: "All",
  healthScore: 0,
  sortBy: "Best match",
};

export const LOADING_MESSAGES = [
  "Analyzing your skills...",
  "Finding active repositories...",
  "Matching open issues...",
  "Ranking projects by compatibility...",
];
