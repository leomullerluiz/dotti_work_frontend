"use client";

import type { ReactNode } from "react";
import { AuthenticatedConsentBanner } from "@/components/privacy/AuthenticatedConsentBanner";
import { AuthProvider } from "./AuthContext";
import { ConsentProvider } from "./ConsentContext";
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
          <ConsentProvider>
            <HistoryProvider>
              <ProfileProvider>
                <SavedProjectsProvider>
                  <MatchesProvider>
                    {children}
                    <AuthenticatedConsentBanner />
                  </MatchesProvider>
                </SavedProjectsProvider>
              </ProfileProvider>
            </HistoryProvider>
          </ConsentProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
