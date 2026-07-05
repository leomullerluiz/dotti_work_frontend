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
import { STORAGE_KEYS } from "@/data/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { adaptApiHistoryEvents } from "@/services/dotti/adapters";
import { DottiApiError } from "@/services/dotti/client";
import {
  clearHistory as clearHistoryFromApi,
  listHistory,
} from "@/services/dotti/history";
import type { HistoryEvent, HistoryEventType } from "@/types";
import { makeId } from "@/utils/format";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type HistoryInput = {
  type: HistoryEventType;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: HistoryEvent["metadata"];
};

type HistoryContextValue = {
  history: HistoryEvent[];
  isLoading: boolean;
  error: string | null;
  retryHistory: () => Promise<void>;
  addHistory: (event: HistoryInput) => void;
  clearHistory: () => Promise<void>;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

function messageForHistoryError(error: unknown) {
  if (error instanceof DottiApiError) {
    if (error.status === 401) {
      return "Your session expired. Sign in again to load history.";
    }

    return error.message;
  }

  return error instanceof Error
    ? error.message
    : "Could not load interaction history.";
}

function createLocalHistoryEvent(event: HistoryInput): HistoryEvent {
  return {
    id: makeId("history"),
    createdAt: new Date().toISOString(),
    ...event,
  };
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [localHistory, setLocalHistory] = useLocalStorage<HistoryEvent[]>(
    STORAGE_KEYS.history,
    [],
  );
  const [apiHistory, setApiHistory] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();
  const { showToast } = useToast();

  const loadHistory = useCallback(async () => {
    if (status !== "authenticated") {
      setApiHistory([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await listHistory({ limit: 100 });
      setApiHistory(adaptApiHistoryEvents(response.items));
    } catch (loadError) {
      setApiHistory([]);
      setError(messageForHistoryError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setApiHistory([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await listHistory({ limit: 100 });
        if (isCurrent) {
          setApiHistory(adaptApiHistoryEvents(response.items));
        }
      } catch (loadError) {
        if (isCurrent) {
          setApiHistory([]);
          setError(messageForHistoryError(loadError));
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

  const history = status === "authenticated" ? apiHistory : localHistory;

  const addHistory = useCallback(
    (event: HistoryInput) => {
      const historyEvent = createLocalHistoryEvent(event);

      if (status === "authenticated") {
        setApiHistory((current) => [historyEvent, ...current]);
        return;
      }

      setLocalHistory((current) => [historyEvent, ...current]);
    },
    [setLocalHistory, status],
  );

  const clearHistory = useCallback(async () => {
    if (status !== "authenticated") {
      setLocalHistory([]);
      showToast("History cleared", "info");
      return;
    }

    setError(null);

    try {
      await clearHistoryFromApi();
      setApiHistory([]);
      showToast("History cleared", "info");
    } catch (clearError) {
      const message = messageForHistoryError(clearError);
      setError(message);
      showToast(message, "error");
      throw clearError;
    }
  }, [setLocalHistory, showToast, status]);

  const value = useMemo(
    () => ({
      history,
      isLoading,
      error,
      retryHistory: loadHistory,
      addHistory,
      clearHistory,
    }),
    [addHistory, clearHistory, error, history, isLoading, loadHistory],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used inside HistoryProvider");
  }
  return context;
}
