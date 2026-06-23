"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/data/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { HistoryEvent, HistoryEventType } from "@/types";
import { makeId } from "@/utils/format";
import { useToast } from "./ToastContext";

type HistoryInput = {
  type: HistoryEventType;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: HistoryEvent["metadata"];
};

type HistoryContextValue = {
  history: HistoryEvent[];
  addHistory: (event: HistoryInput) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<HistoryEvent[]>(
    STORAGE_KEYS.history,
    [],
  );
  const { showToast } = useToast();

  const addHistory = useCallback(
    (event: HistoryInput) => {
      setHistory((current) => [
        {
          id: makeId("history"),
          createdAt: new Date().toISOString(),
          ...event,
        },
        ...current,
      ]);
    },
    [setHistory],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    showToast("History cleared", "info");
  }, [setHistory, showToast]);

  const value = useMemo(
    () => ({ history, addHistory, clearHistory }),
    [addHistory, clearHistory, history],
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
