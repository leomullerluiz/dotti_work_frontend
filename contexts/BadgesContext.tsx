"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { listBadgeCatalog, listMyBadges } from "@/services/dotti/badges";
import type { ApiBadge, ApiMyBadges, ApiUserBadge } from "@/services/dotti/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type BadgesContextValue = {
  catalog: ApiBadge[];
  earned: ApiUserBadge[];
  progress: ApiMyBadges["progress"];
  recentlyAwarded: ApiUserBadge[];
  isLoading: boolean;
  error: string | null;
  refreshBadges: () => Promise<void>;
};

const BadgesContext = createContext<BadgesContextValue | null>(null);

function messageForBadgesError(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Could not load achievements.",
    unauthorized: "Your session expired. Sign in again to load achievements.",
    rateLimited: "Achievements are temporarily rate limited. Try again soon.",
    unavailable: "Achievements are temporarily unavailable.",
  });
}

function toastKeyFor(userBadge: ApiUserBadge) {
  return `${userBadge.slug}:${userBadge.awarded_at}`;
}

export function BadgesProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<ApiBadge[]>([]);
  const [myBadges, setMyBadges] = useState<ApiMyBadges | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownRecentBadges = useRef(new Set<string>());
  const { status } = useAuth();
  const { showToast } = useToast();

  const applyRecentToasts = useCallback(
    (recentlyAwarded: ApiUserBadge[]) => {
      for (const userBadge of recentlyAwarded) {
        const key = toastKeyFor(userBadge);

        if (shownRecentBadges.current.has(key)) {
          continue;
        }

        shownRecentBadges.current.add(key);
        showToast(`Achievement unlocked: ${userBadge.badge.name}`, "success");
      }
    },
    [showToast],
  );

  const loadBadges = useCallback(async () => {
    if (status !== "authenticated") {
      setCatalog([]);
      setMyBadges(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const [catalogResult, myBadgesResult] = await Promise.allSettled([
      listBadgeCatalog(),
      listMyBadges(),
    ]);

    if (catalogResult.status === "fulfilled") {
      setCatalog(catalogResult.value);
    }

    if (myBadgesResult.status === "fulfilled") {
      setMyBadges(myBadgesResult.value);
      applyRecentToasts(myBadgesResult.value.recently_awarded);
    } else {
      setMyBadges(null);
      setError(messageForBadgesError(myBadgesResult.reason));
    }

    setIsLoading(false);
  }, [applyRecentToasts, status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setCatalog([]);
        setMyBadges(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const [catalogResult, myBadgesResult] = await Promise.allSettled([
        listBadgeCatalog(),
        listMyBadges(),
      ]);

      if (!isCurrent) {
        return;
      }

      if (catalogResult.status === "fulfilled") {
        setCatalog(catalogResult.value);
      }

      if (myBadgesResult.status === "fulfilled") {
        setMyBadges(myBadgesResult.value);
        applyRecentToasts(myBadgesResult.value.recently_awarded);
      } else {
        setMyBadges(null);
        setError(messageForBadgesError(myBadgesResult.reason));
      }

      setIsLoading(false);
    }

    void run();

    return () => {
      isCurrent = false;
    };
  }, [applyRecentToasts, status]);

  const value = useMemo<BadgesContextValue>(
    () => ({
      catalog,
      earned: myBadges?.earned ?? [],
      progress: myBadges?.progress ?? [],
      recentlyAwarded: myBadges?.recently_awarded ?? [],
      isLoading,
      error,
      refreshBadges: loadBadges,
    }),
    [catalog, error, isLoading, loadBadges, myBadges],
  );

  return (
    <BadgesContext.Provider value={value}>{children}</BadgesContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgesContext);
  if (!context) {
    throw new Error("useBadges must be used inside BadgesProvider");
  }
  return context;
}
