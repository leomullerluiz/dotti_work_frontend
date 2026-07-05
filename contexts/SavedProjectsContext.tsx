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
import {
  adaptApiUserRepositoryState,
  adaptApiUserRepositoryStateToMatchedProject,
  projectStatusToApiRepositoryState,
} from "@/services/dotti/adapters";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import {
  deleteRepositoryState,
  listUserRepositories,
  restoreRepository,
  setRepositoryState,
} from "@/services/dotti/repositoryStates";
import type { ApiUserRepositoryState } from "@/services/dotti/types";
import type { MatchedProject, ProjectStatus, SavedProject } from "@/types";
import { useAuth } from "./AuthContext";
import { useHistory } from "./HistoryContext";
import { useToast } from "./ToastContext";

export type UserRepositoryRecord = {
  saved: SavedProject;
  project: MatchedProject | null;
};

type SavedProjectsContextValue = {
  savedProjects: SavedProject[];
  userRepositories: UserRepositoryRecord[];
  ignoredProjectIds: string[];
  isLoading: boolean;
  error: string | null;
  retryUserRepositories: () => Promise<void>;
  saveProject: (repositoryId: string, project?: MatchedProject) => Promise<void>;
  removeProject: (repositoryId: string) => Promise<void>;
  updateStatus: (
    repositoryId: string,
    status: ProjectStatus,
    project?: MatchedProject,
  ) => Promise<void>;
  ignoreProject: (repositoryId: string, project?: MatchedProject) => Promise<void>;
  restoreProject: (repositoryId: string) => Promise<void>;
  clearSaved: () => Promise<void>;
  clearIgnored: () => Promise<void>;
  isSaved: (repositoryId: string) => boolean;
};

const SavedProjectsContext = createContext<SavedProjectsContextValue | null>(null);

function messageForRepositoryStateError(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Could not update repository state.",
    unauthorized: "Your session expired. Sign in again to manage saved projects.",
    validation: "The repository status was rejected by the API.",
  });
}

function repositoryNameFor(project: MatchedProject | undefined) {
  return project ? `${project.owner}/${project.repo}` : undefined;
}

function mergeRepositoryState(
  current: ApiUserRepositoryState[],
  next: ApiUserRepositoryState,
) {
  const existing = current.find(
    (item) => item.github_repository_id === next.github_repository_id,
  );
  const merged = {
    ...existing,
    ...next,
    repository: next.repository ?? existing?.repository ?? null,
  };

  if (!existing) {
    return [merged, ...current];
  }

  return current.map((item) =>
    item.github_repository_id === next.github_repository_id ? merged : item,
  );
}

export function SavedProjectsProvider({ children }: { children: ReactNode }) {
  const [repositoryStates, setRepositoryStates] = useState<ApiUserRepositoryState[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();
  const { addHistory } = useHistory();
  const { showToast } = useToast();

  const loadUserRepositories = useCallback(async () => {
    if (status !== "authenticated") {
      setRepositoryStates([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await listUserRepositories({ limit: 100 });
      setRepositoryStates(response.items);
    } catch (loadError) {
      setRepositoryStates([]);
      setError(messageForRepositoryStateError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setRepositoryStates([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await listUserRepositories({ limit: 100 });
        if (isCurrent) {
          setRepositoryStates(response.items);
        }
      } catch (loadError) {
        if (isCurrent) {
          setRepositoryStates([]);
          setError(messageForRepositoryStateError(loadError));
        }
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

  const userRepositories = useMemo<UserRepositoryRecord[]>(
    () =>
      repositoryStates.map((state) => ({
        saved: adaptApiUserRepositoryState(state),
        project: adaptApiUserRepositoryStateToMatchedProject(state),
      })),
    [repositoryStates],
  );

  const savedProjects = useMemo(
    () =>
      userRepositories
        .map((record) => record.saved)
        .filter((saved) => saved.status !== "Ignored"),
    [userRepositories],
  );

  const ignoredProjectIds = useMemo(
    () =>
      userRepositories
        .filter((record) => record.saved.status === "Ignored")
        .map((record) => record.saved.repositoryId),
    [userRepositories],
  );

  const isSaved = useCallback(
    (repositoryId: string) =>
      savedProjects.some((project) => project.repositoryId === repositoryId),
    [savedProjects],
  );

  const applyState = useCallback((next: ApiUserRepositoryState) => {
    setRepositoryStates((current) => mergeRepositoryState(current, next));
  }, []);

  const updateStatus = useCallback(
    async (
      repositoryId: string,
      statusValue: ProjectStatus,
      project?: MatchedProject,
    ) => {
      try {
        const nextState = await setRepositoryState(repositoryId, {
          state: projectStatusToApiRepositoryState(statusValue),
        });
        applyState(nextState);

        const repositoryName = repositoryNameFor(project);
        if (repositoryName && statusValue === "Working") {
          addHistory({
            type: "Marked as contributing",
            repositoryId,
            repositoryName,
          });
        }

        if (repositoryName && statusValue === "Contributed") {
          addHistory({
            type: "Marked as contributed",
            repositoryId,
            repositoryName,
          });
        }

        showToast(`Status updated to ${statusValue}`);
      } catch (updateError) {
        const message = messageForRepositoryStateError(updateError);
        setError(message);
        showToast(message, "error");
        throw updateError;
      }
    },
    [addHistory, applyState, showToast],
  );

  const saveProject = useCallback(
    async (repositoryId: string, project?: MatchedProject) => {
      try {
        const nextState = await setRepositoryState(repositoryId, {
          state: "saved",
        });
        applyState(nextState);

        const repositoryName = repositoryNameFor(project);
        if (repositoryName) {
          addHistory({
            type: "Saved project",
            repositoryId,
            repositoryName,
          });
        }

        showToast("Project saved");
      } catch (saveError) {
        const message = messageForRepositoryStateError(saveError);
        setError(message);
        showToast(message, "error");
        throw saveError;
      }
    },
    [addHistory, applyState, showToast],
  );

  const removeProject = useCallback(
    async (repositoryId: string) => {
      try {
        await deleteRepositoryState(repositoryId);
        setRepositoryStates((current) =>
          current.filter(
            (state) => String(state.github_repository_id) !== repositoryId,
          ),
        );
        showToast("Project removed from saved", "info");
      } catch (removeError) {
        const message = messageForRepositoryStateError(removeError);
        setError(message);
        showToast(message, "error");
        throw removeError;
      }
    },
    [showToast],
  );

  const ignoreProject = useCallback(
    async (repositoryId: string, project?: MatchedProject) => {
      try {
        const nextState = await setRepositoryState(repositoryId, {
          state: "ignored",
        });
        applyState(nextState);

        const repositoryName = repositoryNameFor(project);
        if (repositoryName) {
          addHistory({
            type: "Ignored project",
            repositoryId,
            repositoryName,
          });
        }

        showToast("Project ignored", "info");
      } catch (ignoreError) {
        const message = messageForRepositoryStateError(ignoreError);
        setError(message);
        showToast(message, "error");
        throw ignoreError;
      }
    },
    [addHistory, applyState, showToast],
  );

  const restoreProject = useCallback(
    async (repositoryId: string) => {
      try {
        const nextState = await restoreRepository(repositoryId);
        applyState(nextState);
        showToast("Project restored");
      } catch (restoreError) {
        const message = messageForRepositoryStateError(restoreError);
        setError(message);
        showToast(message, "error");
        throw restoreError;
      }
    },
    [applyState, showToast],
  );

  const clearSaved = useCallback(async () => {
    const ids = savedProjects.map((project) => project.repositoryId);
    try {
      await Promise.all(ids.map((repositoryId) => deleteRepositoryState(repositoryId)));
      setRepositoryStates((current) =>
        current.filter(
          (state) => !ids.includes(String(state.github_repository_id)),
        ),
      );
      showToast("Saved projects cleared", "info");
    } catch (clearError) {
      const message = messageForRepositoryStateError(clearError);
      setError(message);
      showToast(message, "error");
      throw clearError;
    }
  }, [savedProjects, showToast]);

  const clearIgnored = useCallback(async () => {
    try {
      await Promise.all(
        ignoredProjectIds.map((repositoryId) => restoreRepository(repositoryId)),
      );
      setRepositoryStates((current) =>
        current.map((state) =>
          ignoredProjectIds.includes(String(state.github_repository_id))
            ? {
                ...state,
                state: "saved",
              }
            : state,
        ),
      );
      showToast("Ignored projects restored", "info");
    } catch (clearError) {
      const message = messageForRepositoryStateError(clearError);
      setError(message);
      showToast(message, "error");
      throw clearError;
    }
  }, [ignoredProjectIds, showToast]);

  const value = useMemo(
    () => ({
      savedProjects,
      userRepositories,
      ignoredProjectIds,
      isLoading,
      error,
      retryUserRepositories: loadUserRepositories,
      saveProject,
      removeProject,
      updateStatus,
      ignoreProject,
      restoreProject,
      clearSaved,
      clearIgnored,
      isSaved,
    }),
    [
      clearIgnored,
      clearSaved,
      error,
      ignoredProjectIds,
      ignoreProject,
      isLoading,
      isSaved,
      loadUserRepositories,
      removeProject,
      restoreProject,
      saveProject,
      savedProjects,
      updateStatus,
      userRepositories,
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
