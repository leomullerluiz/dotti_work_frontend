"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/data/constants";
import { mockProjects } from "@/data/repositories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ProjectStatus, SavedProject } from "@/types";
import { useHistory } from "./HistoryContext";
import { useToast } from "./ToastContext";

type SavedProjectsContextValue = {
  savedProjects: SavedProject[];
  saveProject: (repositoryId: string) => void;
  removeProject: (repositoryId: string) => void;
  updateStatus: (repositoryId: string, status: ProjectStatus) => void;
  clearSaved: () => void;
  isSaved: (repositoryId: string) => boolean;
};

const SavedProjectsContext = createContext<SavedProjectsContextValue | null>(null);

export function SavedProjectsProvider({ children }: { children: ReactNode }) {
  const [savedProjects, setSavedProjects] = useLocalStorage<SavedProject[]>(
    STORAGE_KEYS.savedProjects,
    [],
  );
  const { addHistory } = useHistory();
  const { showToast } = useToast();

  const isSaved = useCallback(
    (repositoryId: string) =>
      savedProjects.some((project) => project.repositoryId === repositoryId),
    [savedProjects],
  );

  const saveProject = useCallback(
    (repositoryId: string) => {
      const project = mockProjects.find((item) => item.id === repositoryId);
      setSavedProjects((current) => {
        if (current.some((item) => item.repositoryId === repositoryId)) {
          return current;
        }

        return [
          {
            repositoryId,
            status: "Saved",
            savedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...current,
        ];
      });

      if (project) {
        addHistory({
          type: "Saved project",
          repositoryId,
          repositoryName: `${project.owner}/${project.repo}`,
        });
      }
      showToast("Project saved");
    },
    [addHistory, setSavedProjects, showToast],
  );

  const removeProject = useCallback(
    (repositoryId: string) => {
      setSavedProjects((current) =>
        current.filter((project) => project.repositoryId !== repositoryId),
      );
      showToast("Project removed from saved", "info");
    },
    [setSavedProjects, showToast],
  );

  const updateStatus = useCallback(
    (repositoryId: string, status: ProjectStatus) => {
      const project = mockProjects.find((item) => item.id === repositoryId);
      setSavedProjects((current) => {
        const updatedAt = new Date().toISOString();
        const exists = current.some(
          (savedProject) => savedProject.repositoryId === repositoryId,
        );

        if (!exists) {
          return [
            {
              repositoryId,
              status,
              savedAt: updatedAt,
              updatedAt,
            },
            ...current,
          ];
        }

        return current.map((savedProject) =>
          savedProject.repositoryId === repositoryId
            ? {
                ...savedProject,
                status,
                updatedAt,
              }
            : savedProject,
        );
      });

      if (project && status === "Working") {
        addHistory({
          type: "Marked as contributing",
          repositoryId,
          repositoryName: `${project.owner}/${project.repo}`,
        });
      }

      if (project && status === "Contributed") {
        addHistory({
          type: "Marked as contributed",
          repositoryId,
          repositoryName: `${project.owner}/${project.repo}`,
        });
      }

      showToast(`Status updated to ${status}`);
    },
    [addHistory, setSavedProjects, showToast],
  );

  const clearSaved = useCallback(() => {
    setSavedProjects([]);
    showToast("Saved projects cleared", "info");
  }, [setSavedProjects, showToast]);

  const value = useMemo(
    () => ({
      savedProjects,
      saveProject,
      removeProject,
      updateStatus,
      clearSaved,
      isSaved,
    }),
    [
      clearSaved,
      isSaved,
      removeProject,
      saveProject,
      savedProjects,
      updateStatus,
    ],
  );

  return (
    <SavedProjectsContext.Provider value={value}>
      {children}
    </SavedProjectsContext.Provider>
  );
}

export function useSavedProjects() {
  const context = useContext(SavedProjectsContext);
  if (!context) {
    throw new Error("useSavedProjects must be used inside SavedProjectsProvider");
  }
  return context;
}
