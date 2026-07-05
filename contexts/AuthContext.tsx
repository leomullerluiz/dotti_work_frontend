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
  getOptionalAuthenticatedUser,
  logoutAllSessions,
  logoutCurrentSession,
  type AuthMeData,
} from "@/services/dotti/auth";
import { isUnauthorizedError } from "@/services/dotti/client";
import { clearPendingOnboarding } from "@/services/dotti/localStorageStrategy";

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthContextValue = {
  session: AuthMeData | null;
  status: AuthStatus;
  error: string | null;
  isAuthenticated: boolean;
  refreshSession: () => Promise<AuthMeData | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function messageForError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Could not verify the current session.";
}

function clearLogoutLocalState() {
  if (typeof window === "undefined") {
    return;
  }

  clearPendingOnboarding(window.localStorage);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthMeData | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus("checking");
    setError(null);

    try {
      const nextSession = await getOptionalAuthenticatedUser();
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
      return nextSession;
    } catch (refreshError) {
      setSession(null);
      setStatus("error");
      setError(messageForError(refreshError));
      throw refreshError;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCurrentSession();
      clearLogoutLocalState();
      setSession(null);
      setStatus("unauthenticated");
      setError(null);
    } catch (logoutError) {
      if (isUnauthorizedError(logoutError)) {
        clearLogoutLocalState();
        setSession(null);
        setStatus("unauthenticated");
        setError(null);
        return;
      }

      throw logoutError;
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await logoutAllSessions();
      clearLogoutLocalState();
      setSession(null);
      setStatus("unauthenticated");
      setError(null);
    } catch (logoutError) {
      if (isUnauthorizedError(logoutError)) {
        clearLogoutLocalState();
        setSession(null);
        setStatus("unauthenticated");
        setError(null);
        return;
      }

      throw logoutError;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getOptionalAuthenticatedUser()
      .then((nextSession) => {
        if (!isMounted) {
          return;
        }

        setSession(nextSession);
        setStatus(nextSession ? "authenticated" : "unauthenticated");
        setError(null);
      })
      .catch((sessionError) => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setStatus("error");
        setError(messageForError(sessionError));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      error,
      isAuthenticated: Boolean(session) && status === "authenticated",
      refreshSession,
      logout,
      logoutAll,
    }),
    [error, logout, logoutAll, refreshSession, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
