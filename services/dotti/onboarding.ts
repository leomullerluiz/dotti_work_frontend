import type {
  ActivityLevel,
  ContributionType,
  DeveloperProfile,
  DifficultyLevel,
  MatchPreferences,
  OrganizationType,
  ProjectSize,
  SeniorityLevel,
  SkillLevel,
} from "@/types";
import { DottiApiError, dottiRequest } from "./client";

type ApiTechnology = {
  id: number;
  slug: string;
  name: string;
  category: string;
  github_language: string | null;
  github_topics: string[];
  is_active: boolean;
};

type CatalogResponse = {
  items: ApiTechnology[];
  pagination: {
    next_cursor: string | number | null;
  };
};

type ProfileUpdateInput = {
  display_name?: string | null;
  role?: string | null;
  seniority?: "junior" | "mid" | "senior" | null;
  goals?: string[];
  onboarding_completed?: boolean;
};

type UserTechnologyInput = {
  technology_id: number;
  proficiency_level: "learning" | "basic" | "daily" | "advanced";
  interest_level: "learn" | "contribute" | "mentor";
};

type UserPreferenceInput = {
  contribution_types: string[];
  difficulty_levels: string[];
  project_sizes: string[];
  documentation_languages: string[];
  organization_types: string[];
  activity_window_days: number;
  minimum_stars: number;
  require_good_first_issue: boolean;
  require_help_wanted: boolean;
  default_sort_by: string;
};

type OnboardingSubmissionResult = {
  matchedTechnologies: number;
  skippedTechnologies: string[];
  refreshStarted: boolean;
  refreshSkippedReason?: string;
};

const seniorityMap: Record<SeniorityLevel, "junior" | "mid" | "senior"> = {
  Junior: "junior",
  "Mid-Level": "mid",
  Senior: "senior",
};

const goalMap: Record<string, string> = {
  "Make my first contribution": "first_contribution",
  "Build portfolio": "build_portfolio",
  "Gain practical experience": "practical_experience",
  "Join open source communities": "join_communities",
  "Find long-term projects": "long_term_projects",
};

const proficiencyMap: Record<SkillLevel, UserTechnologyInput["proficiency_level"]> = {
  Learning: "learning",
  Basic: "basic",
  "Daily use": "daily",
  Advanced: "advanced",
};

const contributionTypeMap: Record<ContributionType, string> = {
  "Bug fix": "bug_fix",
  Feature: "feature",
  Documentation: "documentation",
  Tests: "tests",
  Performance: "performance",
  Refactoring: "refactor",
  Accessibility: "accessibility",
  Translation: "translation",
};

const difficultyMap: Record<DifficultyLevel, string> = {
  Beginner: "beginner",
  Easy: "beginner",
  Medium: "intermediate",
  Hard: "advanced",
};

const projectSizeMap: Record<ProjectSize, string[]> = {
  Any: ["small", "medium", "large"],
  Small: ["small"],
  Medium: ["medium"],
  Large: ["large"],
};

const organizationTypeMap: Record<OrganizationType, string[]> = {
  Any: ["any"],
  Community: ["community"],
  "Company-backed": ["company"],
  Foundation: ["foundation"],
  "Solo maintainer": ["independent"],
};

const activityWindowMap: Record<ActivityLevel, number> = {
  "Very active": 30,
  High: 90,
  Moderate: 180,
  Low: 365,
};

export function profileToApiInput(profile: DeveloperProfile): ProfileUpdateInput {
  return {
    display_name: profile.name?.trim() || null,
    role: profile.role || null,
    seniority: seniorityMap[profile.seniority],
    goals: profile.goal ? [goalMap[profile.goal] ?? profile.goal] : [],
    onboarding_completed: true,
  };
}

export function preferencesToApiInput(
  preferences: MatchPreferences,
): UserPreferenceInput {
  return {
    contribution_types: preferences.contributionTypes.map(
      (type) => contributionTypeMap[type],
    ),
    difficulty_levels: [difficultyMap[preferences.difficulty]],
    project_sizes: projectSizeMap[preferences.projectSize],
    documentation_languages: ["en", "pt", "any"],
    organization_types: organizationTypeMap[preferences.organizationType],
    activity_window_days: activityWindowMap[preferences.activityLevel],
    minimum_stars: 0,
    require_good_first_issue: preferences.difficulty === "Beginner",
    require_help_wanted: false,
    default_sort_by: "best_match",
  };
}

async function listTechnologies() {
  const response = await dottiRequest<CatalogResponse>(
    "/catalog/technologies?active=true&limit=100",
  );
  return response.items;
}

function technologiesToApiInput(
  profile: DeveloperProfile,
  catalog: ApiTechnology[],
) {
  const catalogByName = new Map(
    catalog.map((technology) => [technology.name.toLowerCase(), technology]),
  );
  const skippedTechnologies: string[] = [];
  const technologies: UserTechnologyInput[] = [];

  profile.technologies.slice(0, 50).forEach((technology) => {
    const apiTechnology = catalogByName.get(technology.name.toLowerCase());

    if (!apiTechnology) {
      skippedTechnologies.push(technology.name);
      return;
    }

    technologies.push({
      technology_id: apiTechnology.id,
      proficiency_level: proficiencyMap[technology.level],
      interest_level: "contribute",
    });
  });

  return {
    technologies,
    skippedTechnologies,
  };
}

export async function submitOnboardingToApi(
  profile: DeveloperProfile,
): Promise<OnboardingSubmissionResult> {
  const catalog = await listTechnologies();
  const { technologies, skippedTechnologies } = technologiesToApiInput(
    profile,
    catalog,
  );

  await dottiRequest("/me/profile", {
    method: "PUT",
    body: profileToApiInput(profile),
  });

  await dottiRequest("/me/technologies", {
    method: "PUT",
    body: { technologies },
  });

  await dottiRequest("/me/preferences", {
    method: "PUT",
    body: preferencesToApiInput(profile.preferences),
  });

  try {
    await dottiRequest("/matches/refresh", {
      method: "POST",
    });

    return {
      matchedTechnologies: technologies.length,
      skippedTechnologies,
      refreshStarted: true,
    };
  } catch (error) {
    if (
      error instanceof DottiApiError &&
      [429, 502, 503].includes(error.status)
    ) {
      return {
        matchedTechnologies: technologies.length,
        skippedTechnologies,
        refreshStarted: false,
        refreshSkippedReason: error.message,
      };
    }

    throw error;
  }
}
