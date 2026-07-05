"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FILTERS, STORAGE_KEYS } from "@/data/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { adaptApiMatchToMatchedProject } from "@/services/dotti/adapters";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { matchFiltersToApiParams } from "@/services/dotti/matchFilters";
import {
  listMatches,
  refreshMatches as refreshMatchesFromApi,
} from "@/services/dotti/matches";
import type { MatchedProject, TechnologyFilter } from "@/types";
import { useAuth } from "./AuthContext";
import { useSavedProjects } from "./SavedProjectsContext";
import { useToast } from "./ToastContext";

type MatchesContextValue = {
  filters: TechnologyFilter;
  projects: MatchedProject[];
  availableLanguages: string[];
  ignoredProjectIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  setFilters: (filters: TechnologyFilter) => void;
  resetFilters: () => void;
  refreshMatches: () => void;
  retryMatches: () => void;
  ignoreProject: (repositoryId: string) => Promise<void>;
  undoIgnore: (repositoryId: string) => Promise<void>;
  clearIgnored: () => Promise<void>;
  getProjectById: (repositoryId: string) => MatchedProject | undefined;
};

const MatchesContext = createContext<MatchesContextValue | null>(null);

function filterProjects(
  projects: MatchedProject[],
  filters: TechnologyFilter,
  ignoredProjectIds: string[],
) {
  const query = filters.query.trim().toLowerCase();

  const filtered = projects.filter((project) => {
    if (ignoredProjectIds.includes(project.id)) {
      return false;
    }

    const searchBlob = [
      project.owner,
      project.repo,
      project.name,
      project.description,
      ...project.languages,
      ...project.topics,
    ]
      .join(" ")
      .toLowerCase();

    if (query && !searchBlob.includes(query)) {
      return false;
    }

    if (
      filters.technologies.length > 0 &&
      !filters.technologies.some((tech) => project.languages.includes(tech))
    ) {
      return false;
    }

    if (filters.difficulty !== "All" && project.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.projectSize !== "All" && project.size !== filters.projectSize) {
      return false;
    }

    if (filters.activity !== "All" && project.activity !== filters.activity) {
      return false;
    }

    if (filters.hasGoodFirstIssue && project.goodFirstIssues === 0) {
      return false;
    }

    if (filters.hasHelpWanted && project.helpWantedIssues === 0) {
      return false;
    }

    if (project.stars < filters.minimumStars) {
      return false;
    }

    if (filters.language !== "All" && !project.languages.includes(filters.language)) {
      return false;
    }

    return project.healthScore >= filters.healthScore;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case "Most active":
        return b.activityScore - a.activityScore;
      case "Most stars":
        return b.stars - a.stars;
      case "Most beginner friendly":
        return b.goodFirstIssues - a.goodFirstIssues;
      case "Recently updated":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "Best match":
      default:
        return b.matchScore - a.matchScore;
    }
  });
}

function messageForMatchesError(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Could not load matches from the API.",
    rateLimited: "Match refresh is temporarily rate limited. Try again in a few minutes.",
    unavailable: "GitHub or the matching API is temporarily unavailable. Please retry shortly.",
    validation: "The match filters were rejected by the API.",
  });
}

function uniqueLanguages(projects: MatchedProject[]) {
  return Array.from(
    new Set(projects.flatMap((project) => project.languages)),
  ).sort();
}

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useLocalStorage<TechnologyFilter>(
    STORAGE_KEYS.filters,
    DEFAULT_FILTERS,
  );
  const [apiProjects, setApiProjects] = useState<MatchedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();
  const {
    clearIgnored,
    ignoredProjectIds,
    ignoreProject: ignoreRepository,
    restoreProject,
  } = useSavedProjects();
  const { showToast } = useToast();

  const loadMatches = useCallback(async () => {
    if (status !== "authenticated") {
      setApiProjects([]);
      setError(null);
      setHasLoaded(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await listMatches(matchFiltersToApiParams(filters));
      setApiProjects(response.items.map(adaptApiMatchToMatchedProject));
      setHasLoaded(true);
    } catch (loadError) {
      setApiProjects([]);
      setError(messageForMatchesError(loadError));
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [filters, status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setApiProjects([]);
        setError(null);
        setIsLoading(false);
        setHasLoaded(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await listMatches(matchFiltersToApiParams(filters));
        if (!isCurrent) {
          return;
        }
        setApiProjects(response.items.map(adaptApiMatchToMatchedProject));
        setHasLoaded(true);
      } catch (loadError) {
        if (!isCurrent) {
          return;
        }
        setApiProjects([]);
        setError(messageForMatchesError(loadError));
        setHasLoaded(true);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      isCurrent = false;
    };
  }, [filters, status]);

  const projects = useMemo(
    () => filterProjects(apiProjects, filters, ignoredProjectIds),
    [apiProjects, filters, ignoredProjectIds],
  );

  const availableLanguages = useMemo(
    () => uniqueLanguages(apiProjects),
    [apiProjects],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    showToast("Filters reset", "info");
  }, [setFilters, showToast]);

  const refreshMatches = useCallback(() => {
    async function run() {
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await refreshMatchesFromApi();
        setApiProjects(response.items.map(adaptApiMatchToMatchedProject));
        showToast("Matches refreshed");
      } catch (refreshError) {
        const message = messageForMatchesError(refreshError);
        setError(message);
        showToast(message, "error");
      } finally {
        setIsRefreshing(false);
      }
    }

    void run();
  }, [showToast]);

  const ignoreProject = useCallback(
    async (repositoryId: string) => {
      const project = apiProjects.find((item) => item.id === repositoryId);
      await ignoreRepository(repositoryId, project);
    },
    [apiProjects, ignoreRepository],
  );

  const undoIgnore = useCallback(
    async (repositoryId: string) => {
      await restoreProject(repositoryId);
    },
    [restoreProject],
  );

  const getProjectById = useCallback(
    (repositoryId: string) =>
      apiProjects.find((project) => project.id === repositoryId),
    [apiProjects],
  );

  const value = useMemo(
    () => ({
      filters,
      projects,
      availableLanguages,
      ignoredProjectIds,
      isLoading: isLoading || (status === "authenticated" && !hasLoaded),
      isRefreshing,
      error,
      setFilters,
      resetFilters,
      refreshMatches,
      retryMatches: loadMatches,
      ignoreProject,
      undoIgnore,
      clearIgnored,
      getProjectById,
    }),
    [
      availableLanguages,
      clearIgnored,
      error,
      filters,
      getProjectById,
      hasLoaded,
      ignoredProjectIds,
      ignoreProject,
      isLoading,
      isRefreshing,
      loadMatches,
      projects,
      refreshMatches,
      resetFilters,
      setFilters,
      status,
      undoIgnore,
    ],
  );

  return (
    <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error("useMatches must be used inside MatchesProvider");
  }
  return context;
}
