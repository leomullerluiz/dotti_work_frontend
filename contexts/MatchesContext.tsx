"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FILTERS, STORAGE_KEYS } from "@/data/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { adaptApiMatchToMatchedProject } from "@/services/dotti/adapters";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
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
  const isRefreshingRef = useRef(false);
  const apiProjectsRef = useRef(apiProjects);
  const { status } = useAuth();
  const {
    clearIgnored,
    ignoredProjectIds,
    ignoreProject: ignoreRepository,
    restoreProject,
  } = useSavedProjects();
  const { showToast } = useToast();

  useEffect(() => {
    apiProjectsRef.current = apiProjects;
  }, [apiProjects]);

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
      const response = await listMatches();
      setApiProjects(response.items.map(adaptApiMatchToMatchedProject));
      setHasLoaded(true);
    } catch (loadError) {
      setApiProjects([]);
      setError(messageForMatchesError(loadError));
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

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
        const response = await listMatches();
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
  }, [status]);

  const projects = useMemo(
    () =>
      apiProjects
        .filter((project) => !ignoredProjectIds.includes(project.id))
        .sort((first, second) => second.matchScore - first.matchScore),
    [apiProjects, ignoredProjectIds],
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
    if (status !== "authenticated") {
      return;
    }

    if (isRefreshingRef.current) {
      showToast("Project search is already running.", "info");
      return;
    }

    async function run() {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await refreshMatchesFromApi();
        setApiProjects(response.items.map(adaptApiMatchToMatchedProject));
        setHasLoaded(true);
        showToast("Project search completed.");
      } catch (refreshError) {
        const message = messageForMatchesError(refreshError);
        if (apiProjectsRef.current.length === 0) {
          setError(message);
        }
        showToast(message, "error");
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    }

    void run();
  }, [showToast, status]);

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
