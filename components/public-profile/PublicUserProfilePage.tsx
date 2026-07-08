"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { PublicProfileContent } from "@/components/public-profile/PublicProfileContent";
import { Button, buttonClasses } from "@/components/ui/Button";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { DottiApiError } from "@/services/dotti/client";
import { getPublicUserProfile } from "@/services/dotti/publicProfile";
import type { ApiPublicUserProfileData } from "@/services/dotti/types";
import {
  parsePublicProfilePath,
  publicProfileLoginFromSearch,
} from "@/utils/publicProfileRoutes";

type PublicProfileState =
  | "idle"
  | "loading"
  | "ready"
  | "not-found"
  | "rate-limited"
  | "error";

function stateForError(error: unknown): PublicProfileState {
  if (error instanceof DottiApiError) {
    if (error.status === 404) {
      return "not-found";
    }

    if (error.status === 429) {
      return "rate-limited";
    }
  }

  return "error";
}

function messageForError(error: unknown) {
  if (error instanceof DottiApiError && error.status === 404) {
    return "This profile does not exist or is private.";
  }

  return apiErrorMessage(error, {
    fallback: "Could not load this public profile.",
    rateLimited: "Too many profile views in a short period. Try again in a few minutes.",
    unavailable: "Public profiles are temporarily unavailable. Please retry shortly.",
  });
}

export function PublicUserProfilePage({ login = "" }: { login?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ApiPublicUserProfileData | null>(null);
  const [state, setState] = useState<PublicProfileState>("idle");
  const [message, setMessage] = useState("Loading public profile...");

  const resolvedLogin = useMemo(() => {
    const fromProp = login.trim();
    if (fromProp && fromProp !== "_") {
      return fromProp;
    }

    const fromPath = parsePublicProfilePath(pathname)?.login;
    if (fromPath && fromPath !== "_") {
      return fromPath;
    }

    return publicProfileLoginFromSearch(searchParams.toString()) ?? "";
  }, [login, pathname, searchParams]);

  const loadProfile = useCallback(() => {
    if (!resolvedLogin) {
      setProfile(null);
      setState("not-found");
      setMessage("This profile link is missing a login.");
      return;
    }

    setState("loading");
    setMessage("Loading public profile...");

    getPublicUserProfile(resolvedLogin)
      .then((response) => {
        setProfile(response);
        setState("ready");
        setMessage("");
      })
      .catch((loadError) => {
        setProfile(null);
        setState(stateForError(loadError));
        setMessage(messageForError(loadError));
      });
  }, [resolvedLogin]);

  useEffect(() => {
    void Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  const isLoading = state === "loading" || state === "idle";

  return (
    <main className="min-h-screen bg-app px-4 py-6 text-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Link href="/" className={buttonClasses({ variant: "ghost", size: "sm" })}>
            Back home
          </Link>
        </header>

        <div className="py-8">
          {isLoading ? (
            <StatusPanel
              title="Loading profile"
              description={message}
              icon={<Loader2 className="animate-spin" size={24} />}
            />
          ) : null}

          {state === "ready" && profile ? <PublicProfileContent data={profile} /> : null}

          {state === "not-found" || state === "rate-limited" || state === "error" ? (
            <StatusPanel
              title={
                state === "not-found"
                  ? "Profile not found"
                  : state === "rate-limited"
                    ? "Too many accesses"
                    : "Could not load profile"
              }
              description={message}
              icon={<AlertCircle size={24} />}
              action={
                state === "error" ? (
                  <Button type="button" variant="outline" onClick={loadProfile}>
                    <RotateCcw size={16} />
                    Try again
                  </Button>
                ) : (
                  <Link href="/" className={buttonClasses({ variant: "outline" })}>
                    Go home
                  </Link>
                )
              }
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function StatusPanel({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
        {icon}
      </div>
      <h1 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-white">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
