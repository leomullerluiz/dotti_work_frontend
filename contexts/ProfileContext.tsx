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
import {
  adaptApiProfileToDeveloperProfile,
  developerProfileToApiProfileInput,
  developerProfileToApiTechnologyInputs,
  matchPreferencesToApiInput,
} from "@/services/dotti/adapters";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import {
  getMyPreferences,
  getMyProfile,
  getMyTechnologies,
  listTechnologies,
  replaceMyTechnologies,
  updateMyPreferences,
  updateMyProfile,
} from "@/services/dotti/profile";
import type { DeveloperProfile } from "@/types";
import { downloadJson } from "@/utils/format";
import { useAuth } from "./AuthContext";
import { useBadges } from "./BadgesContext";
import { useToast } from "./ToastContext";

type ProfileContextValue = {
  profile: DeveloperProfile | null;
  isLoading: boolean;
  error: string | null;
  retryProfile: () => Promise<void>;
  saveProfile: (profile: DeveloperProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
  exportProfile: () => void;
  importProfile: (json: string) => Promise<boolean>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function messageForProfileError(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Could not load profile.",
    unauthorized: "Your session expired. Sign in again to load your profile.",
    validation: "Some profile fields were rejected by the API.",
  });
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [localProfile, setLocalProfile] = useLocalStorage<DeveloperProfile | null>(
    STORAGE_KEYS.profile,
    null,
  );
  const [apiProfile, setApiProfile] = useState<DeveloperProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();
  const { refreshBadges } = useBadges();
  const { showToast } = useToast();

  const loadProfile = useCallback(async () => {
    if (status !== "authenticated") {
      setApiProfile(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [profileResponse, technologies, preferences] = await Promise.all([
        getMyProfile(),
        getMyTechnologies(),
        getMyPreferences(),
      ]);

      setApiProfile(
        adaptApiProfileToDeveloperProfile({
          user: profileResponse.user,
          profile: profileResponse.profile,
          technologies,
          preferences,
        }),
      );
    } catch (loadError) {
      setApiProfile(null);
      setError(messageForProfileError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setApiProfile(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [profileResponse, technologies, preferences] = await Promise.all([
          getMyProfile(),
          getMyTechnologies(),
          getMyPreferences(),
        ]);

        if (isCurrent) {
          setApiProfile(
            adaptApiProfileToDeveloperProfile({
              user: profileResponse.user,
              profile: profileResponse.profile,
              technologies,
              preferences,
            }),
          );
        }
      } catch (loadError) {
        if (isCurrent) {
          setApiProfile(null);
          setError(messageForProfileError(loadError));
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

  const profile = status === "authenticated" ? apiProfile : localProfile;

  const saveProfile = useCallback(
    async (nextProfile: DeveloperProfile) => {
      const nextProfileWithDate = {
        ...nextProfile,
        updatedAt: new Date().toISOString(),
      };

      if (status !== "authenticated") {
        setLocalProfile(nextProfileWithDate);
        setApiProfile(null);
        showToast("Profile saved");
        return;
      }

      setApiProfile(nextProfileWithDate);
      setError(null);

      try {
        const catalog = await listTechnologies({ active: true, limit: 100 });
        const { technologies, skippedTechnologies } =
          developerProfileToApiTechnologyInputs(nextProfileWithDate, catalog.items);

        const [profileResponse, savedTechnologies, preferences] =
          await Promise.all([
            updateMyProfile(developerProfileToApiProfileInput(nextProfileWithDate)),
            replaceMyTechnologies(technologies),
            updateMyPreferences(
              matchPreferencesToApiInput(nextProfileWithDate.preferences),
            ),
          ]);

        setApiProfile(
          adaptApiProfileToDeveloperProfile({
            user: profileResponse.user,
            profile: profileResponse.profile,
            technologies: savedTechnologies,
            preferences,
          }),
        );

        showToast(
          skippedTechnologies.length > 0
            ? `Profile saved. ${skippedTechnologies.length} technologies were not in the API catalog.`
            : "Profile saved",
          skippedTechnologies.length > 0 ? "info" : "success",
        );
        void refreshBadges();
      } catch (saveError) {
        const message = messageForProfileError(saveError);
        setError(message);
        showToast(message, "error");
        throw saveError;
      }
    },
    [refreshBadges, setLocalProfile, showToast, status],
  );

  const resetProfile = useCallback(async () => {
    setLocalProfile(null);
    setApiProfile(null);

    if (status !== "authenticated") {
      showToast("Profile reset", "info");
      return;
    }

    setError(null);

    try {
      const [profileResponse, savedTechnologies, preferences] =
        await Promise.all([
          updateMyProfile({
            display_name: null,
            role: null,
            seniority: null,
            goals: [],
            onboarding_completed: false,
          }),
          replaceMyTechnologies([]),
          updateMyPreferences(matchPreferencesToApiInput({
            contributionTypes: ["Bug fix", "Documentation"],
            difficulty: "Easy",
            projectSize: "Any",
            activityLevel: "High",
            preferredLanguage: "Any",
            organizationType: "Any",
          })),
        ]);

      setApiProfile(
        adaptApiProfileToDeveloperProfile({
          user: profileResponse.user,
          profile: profileResponse.profile,
          technologies: savedTechnologies,
          preferences,
        }),
      );
      showToast("Profile reset", "info");
      void refreshBadges();
    } catch (resetError) {
      const message = messageForProfileError(resetError);
      setError(message);
      showToast(message, "error");
      throw resetError;
    }
  }, [refreshBadges, setLocalProfile, showToast, status]);

  const exportProfile = useCallback(() => {
    downloadJson("dotti-profile.json", profile);
    showToast("Profile exported");
  }, [profile, showToast]);

  const importProfile = useCallback(
    async (json: string) => {
      try {
        const parsed = JSON.parse(json) as DeveloperProfile;
        if (!parsed.role || !parsed.seniority || !Array.isArray(parsed.technologies)) {
          throw new Error("Invalid profile");
        }

        await saveProfile({
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
    [saveProfile, showToast],
  );

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      error,
      retryProfile: loadProfile,
      saveProfile,
      resetProfile,
      exportProfile,
      importProfile,
    }),
    [
      error,
      exportProfile,
      importProfile,
      isLoading,
      loadProfile,
      profile,
      resetProfile,
      saveProfile,
    ],
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
