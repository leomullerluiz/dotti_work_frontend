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
import {
  listBadgeCatalog,
  listMyBadges,
  markBadgeNotificationsViewed,
  type BadgeNotificationViewedResponse,
} from "@/services/dotti/badges";
import type { ApiBadge, ApiMyBadges, ApiUserBadge } from "@/services/dotti/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type BadgesContextValue = {
  catalog: ApiBadge[];
  earned: ApiUserBadge[];
  progress: ApiMyBadges["progress"];
  recentlyAwarded: ApiUserBadge[];
  unseenAwarded: ApiUserBadge[];
  unseenAwardedCount: number;
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

function badgeNotificationKeyFor(userBadge: ApiUserBadge) {
  return `${userBadge.id ?? userBadge.slug}:${userBadge.awarded_at}`;
}

function hasServerNotificationQueue(myBadges: ApiMyBadges) {
  return Object.prototype.hasOwnProperty.call(myBadges, "unseen_awarded");
}

function unseenAwardedFor(myBadges: ApiMyBadges) {
  const source = hasServerNotificationQueue(myBadges)
    ? myBadges.unseen_awarded ?? []
    : myBadges.recently_awarded;

  return source.filter((userBadge) => userBadge.notification_seen !== true);
}

function uniqueSlugsFor(userBadges: ApiUserBadge[]) {
  return [...new Set(userBadges.map((item) => item.slug).filter(Boolean))];
}

function mergeViewedNotifications(
  current: ApiMyBadges,
  response: BadgeNotificationViewedResponse,
  markedSlugs: string[],
): ApiMyBadges {
  const markedSlugSet = new Set(markedSlugs);
  const viewedBySlug = new Map(
    response.recently_awarded.map((item) => [item.slug, item]),
  );

  function markList(items: ApiUserBadge[]) {
    return items.map((item) => {
      const viewed = viewedBySlug.get(item.slug);

      if (viewed) {
        return {
          ...item,
          notification_seen: viewed.notification_seen,
          notification_seen_at:
            viewed.notification_seen_at ?? item.notification_seen_at ?? null,
        };
      }

      if (markedSlugSet.has(item.slug)) {
        return {
          ...item,
          notification_seen: true,
          notification_seen_at: item.notification_seen_at ?? null,
        };
      }

      return item;
    });
  }

  return {
    ...current,
    earned: markList(current.earned),
    recently_awarded: markList(current.recently_awarded),
    unseen_awarded: response.unseen_awarded,
    unseen_awarded_count: response.unseen_awarded_count,
  };
}

export function BadgesProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<ApiBadge[]>([]);
  const [myBadges, setMyBadges] = useState<ApiMyBadges | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownBadgeNotifications = useRef(new Set<string>());
  const markingBadgeNotifications = useRef(new Set<string>());
  const { status } = useAuth();
  const { showToast } = useToast();

  const applyUnseenToasts = useCallback(
    (nextBadges: ApiMyBadges) => {
      const unseenAwarded = unseenAwardedFor(nextBadges);
      const notificationsToShow = unseenAwarded.filter((userBadge) => {
        const key = badgeNotificationKeyFor(userBadge);
        return !shownBadgeNotifications.current.has(key);
      });
      const notificationsToMark = hasServerNotificationQueue(nextBadges)
        ? unseenAwarded.filter((userBadge) => {
            const key = badgeNotificationKeyFor(userBadge);
            return !markingBadgeNotifications.current.has(key);
          })
        : [];

      for (const userBadge of notificationsToShow) {
        const key = badgeNotificationKeyFor(userBadge);

        shownBadgeNotifications.current.add(key);
        showToast(`Achievement unlocked: ${userBadge.badge.name}`, "success");
      }

      if (notificationsToMark.length === 0) {
        return;
      }

      const slugs = uniqueSlugsFor(notificationsToMark);

      if (slugs.length === 0) {
        return;
      }

      for (const userBadge of notificationsToMark) {
        markingBadgeNotifications.current.add(badgeNotificationKeyFor(userBadge));
      }

      window.setTimeout(() => {
        markBadgeNotificationsViewed({
          slugs,
          notification_seen: true,
        })
          .then((response) => {
            setMyBadges((current) =>
              current ? mergeViewedNotifications(current, response, slugs) : current,
            );
          })
          .catch(() => {
            // Keep unseen notifications in local state; later badge refreshes can retry the mark request.
          })
          .finally(() => {
            for (const userBadge of notificationsToMark) {
              markingBadgeNotifications.current.delete(
                badgeNotificationKeyFor(userBadge),
              );
            }
          });
      }, 0);
    },
    [showToast],
  );

  const loadBadges = useCallback(async () => {
    if (status !== "authenticated") {
      setCatalog([]);
      setMyBadges(null);
      setError(null);
      setIsLoading(false);
      shownBadgeNotifications.current.clear();
      markingBadgeNotifications.current.clear();
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
      applyUnseenToasts(myBadgesResult.value);
    } else {
      setMyBadges(null);
      setError(messageForBadgesError(myBadgesResult.reason));
    }

    setIsLoading(false);
  }, [applyUnseenToasts, status]);

  useEffect(() => {
    let isCurrent = true;

    async function run() {
      if (status !== "authenticated") {
        setCatalog([]);
        setMyBadges(null);
        setError(null);
        setIsLoading(false);
        shownBadgeNotifications.current.clear();
        markingBadgeNotifications.current.clear();
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
        applyUnseenToasts(myBadgesResult.value);
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
  }, [applyUnseenToasts, status]);

  const unseenAwarded = useMemo(
    () => (myBadges ? unseenAwardedFor(myBadges) : []),
    [myBadges],
  );

  const value = useMemo<BadgesContextValue>(
    () => ({
      catalog,
      earned: myBadges?.earned ?? [],
      progress: myBadges?.progress ?? [],
      recentlyAwarded: myBadges?.recently_awarded ?? [],
      unseenAwarded,
      unseenAwardedCount:
        myBadges?.unseen_awarded_count ?? unseenAwarded.length,
      isLoading,
      error,
      refreshBadges: loadBadges,
    }),
    [catalog, error, isLoading, loadBadges, myBadges, unseenAwarded],
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
