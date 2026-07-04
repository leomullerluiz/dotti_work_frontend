"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { HistoryProvider } from "./HistoryContext";
import { MatchesProvider } from "./MatchesContext";
import { ProfileProvider } from "./ProfileContext";
import { SavedProjectsProvider } from "./SavedProjectsContext";
import { ThemeProvider } from "./ThemeContext";
import { ToastProvider } from "./ToastContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <HistoryProvider>
            <ProfileProvider>
              <SavedProjectsProvider>
                <MatchesProvider>{children}</MatchesProvider>
              </SavedProjectsProvider>
            </ProfileProvider>
          </HistoryProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
