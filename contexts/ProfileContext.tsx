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
import type { DeveloperProfile } from "@/types";
import { downloadJson } from "@/utils/format";
import { useToast } from "./ToastContext";

type ProfileContextValue = {
  profile: DeveloperProfile | null;
  saveProfile: (profile: DeveloperProfile) => void;
  resetProfile: () => void;
  exportProfile: () => void;
  importProfile: (json: string) => boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<DeveloperProfile | null>(
    STORAGE_KEYS.profile,
    null,
  );
  const { showToast } = useToast();

  const saveProfile = useCallback(
    (nextProfile: DeveloperProfile) => {
      setProfile({ ...nextProfile, updatedAt: new Date().toISOString() });
      showToast("Profile saved");
    },
    [setProfile, showToast],
  );

  const resetProfile = useCallback(() => {
    setProfile(null);
    showToast("Profile reset", "info");
  }, [setProfile, showToast]);

  const exportProfile = useCallback(() => {
    downloadJson("dotti-profile.json", profile);
    showToast("Profile exported");
  }, [profile, showToast]);

  const importProfile = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as DeveloperProfile;
        if (!parsed.role || !parsed.seniority || !Array.isArray(parsed.technologies)) {
          throw new Error("Invalid profile");
        }
        setProfile({
          ...parsed,
          completedOnboarding: true,
          updatedAt: new Date().toISOString(),
        });
        showToast("Profile imported");
        return true;
      } catch {
        showToast("Could not import profile JSON", "error");
        return false;
      }
    },
    [setProfile, showToast],
  );

  const value = useMemo(
    () => ({ profile, saveProfile, resetProfile, exportProfile, importProfile }),
    [exportProfile, importProfile, profile, resetProfile, saveProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return context;
}
