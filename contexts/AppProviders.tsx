"use client";

import type { ReactNode } from "react";
import { AuthenticatedConsentBanner } from "@/components/privacy/AuthenticatedConsentBanner";
import { AuthProvider } from "./AuthContext";
import { BadgesProvider } from "./BadgesContext";
import { ConsentProvider } from "./ConsentContext";
import { HistoryProvider } from "./HistoryContext";
import { LocalStorageMaintenance } from "./LocalStorageMaintenance";
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
          <LocalStorageMaintenance />
          <ConsentProvider>
            <HistoryProvider>
              <BadgesProvider>
                <ProfileProvider>
                  <SavedProjectsProvider>
                    <MatchesProvider>
                      {children}
                      <AuthenticatedConsentBanner />
                    </MatchesProvider>
                  </SavedProjectsProvider>
                </ProfileProvider>
              </BadgesProvider>
            </HistoryProvider>
          </ConsentProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
