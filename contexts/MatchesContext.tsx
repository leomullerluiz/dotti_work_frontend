"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FILTERS, STORAGE_KEYS } from "@/data/constants";
import { mockProjects } from "@/data/repositories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { MatchedProject, TechnologyFilter } from "@/types";
import { useHistory } from "./HistoryContext";
import { useToast } from "./ToastContext";

type MatchesContextValue = {
  filters: TechnologyFilter;
  projects: MatchedProject[];
  ignoredProjectIds: string[];
  isRefreshing: boolean;
  setFilters: (filters: TechnologyFilter) => void;
  resetFilters: () => void;
  refreshMatches: () => void;
  ignoreProject: (repositoryId: string) => void;
  undoIgnore: (repositoryId: string) => void;
  clearIgnored: () => void;
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

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useLocalStorage<TechnologyFilter>(
    STORAGE_KEYS.filters,
    DEFAULT_FILTERS,
  );
  const [ignoredProjectIds, setIgnoredProjectIds] = useLocalStorage<string[]>(
    STORAGE_KEYS.ignoredProjects,
    [],
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addHistory } = useHistory();
  const { showToast } = useToast();

  const projects = useMemo(
    () => filterProjects(mockProjects, filters, ignoredProjectIds),
    [filters, ignoredProjectIds],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    showToast("Filters reset", "info");
  }, [setFilters, showToast]);

  const refreshMatches = useCallback(() => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast("Matches refreshed");
    }, 900);
  }, [showToast]);

  const ignoreProject = useCallback(
    (repositoryId: string) => {
      const project = mockProjects.find((item) => item.id === repositoryId);
      setIgnoredProjectIds((current) =>
        current.includes(repositoryId) ? current : [repositoryId, ...current],
      );

      if (project) {
        addHistory({
          type: "Ignored project",
          repositoryId,
          repositoryName: `${project.owner}/${project.repo}`,
        });
      }
      showToast("Project ignored", "info");
    },
    [addHistory, setIgnoredProjectIds, showToast],
  );

  const undoIgnore = useCallback(
    (repositoryId: string) => {
      setIgnoredProjectIds((current) =>
        current.filter((projectId) => projectId !== repositoryId),
      );
      showToast("Project restored");
    },
    [setIgnoredProjectIds, showToast],
  );

  const clearIgnored = useCallback(() => {
    setIgnoredProjectIds([]);
    showToast("Ignored projects cleared", "info");
  }, [setIgnoredProjectIds, showToast]);

  const getProjectById = useCallback(
    (repositoryId: string) =>
      mockProjects.find((project) => project.id === repositoryId),
    [],
  );

  const value = useMemo(
    () => ({
      filters,
      projects,
      ignoredProjectIds,
      isRefreshing,
      setFilters,
      resetFilters,
      refreshMatches,
      ignoreProject,
      undoIgnore,
      clearIgnored,
      getProjectById,
    }),
    [
      clearIgnored,
      filters,
      getProjectById,
      ignoredProjectIds,
      ignoreProject,
      isRefreshing,
      projects,
      refreshMatches,
      resetFilters,
      setFilters,
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
