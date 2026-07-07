"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { GitHubAvatar } from "@/components/account/GitHubAvatar";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses, Button } from "@/components/ui/Button";
import { GitHubIcon } from "@/components/ui/Icons";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import {
  buildGitHubOAuthStartUrl,
  DottiApiError,
} from "@/services/dotti/client";
import {
  getPublicInvite,
  PENDING_INVITE_CODE_STORAGE_KEY,
  type PublicInvite,
} from "@/services/dotti/invites";

type InviteState = "loading" | "valid" | "invalid" | "rate-limited" | "error";

function publicInviteErrorState(error: unknown): InviteState {
  if (error instanceof DottiApiError) {
    if (error.status === 404) {
      return "invalid";
    }

    if (error.status === 429) {
      return "rate-limited";
    }
  }

  return "error";
}

function publicInviteErrorMessage(error: unknown) {
  if (error instanceof DottiApiError && error.status === 404) {
    return "This invite is no longer available.";
  }

  return apiErrorMessage(error, {
    fallback: "Could not validate this invite.",
    rateLimited: "Too many attempts. Try again in a few minutes.",
    unavailable: "Invites are temporarily unavailable. Please retry shortly.",
  });
}

export function PublicInvitePage({ code }: { code: string }) {
  const [resolvedCode] = useState(() => {
    if (code !== "_") {
      return code;
    }

    if (typeof window === "undefined") {
      return code;
    }

    return new URLSearchParams(window.location.search).get("code") ?? code;
  });
  const [invite, setInvite] = useState<PublicInvite | null>(null);
  const [state, setState] = useState<InviteState>("loading");
  const [message, setMessage] = useState("Checking this invite...");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const inviterName = invite?.inviter?.display_name?.trim();
  const githubStartUrl = useMemo(
    () => buildGitHubOAuthStartUrl("/onboarding", { inviteCode: resolvedCode }),
    [resolvedCode],
  );

  useEffect(() => {
    let isMounted = true;

    window.sessionStorage.setItem(PENDING_INVITE_CODE_STORAGE_KEY, resolvedCode);
    Promise.resolve()
      .then(() => {
        if (!isMounted) {
          return null;
        }

        setState("loading");
        setMessage("Checking this invite...");
        return getPublicInvite(resolvedCode);
      })
      .then((response) => {
        if (!isMounted || !response) {
          return;
        }

        if (!response.invite.valid) {
          window.sessionStorage.removeItem(PENDING_INVITE_CODE_STORAGE_KEY);
          setInvite(response.invite);
          setState("invalid");
          setMessage("This invite is no longer available.");
          return;
        }

        window.sessionStorage.setItem(PENDING_INVITE_CODE_STORAGE_KEY, resolvedCode);
        setInvite(response.invite);
        setState("valid");
        setMessage(
          response.invite.inviter?.display_name
            ? `${response.invite.inviter.display_name} invited you to dotti.work.`
            : "You received an invite to dotti.work.",
        );
      })
      .catch((validateError) => {
        if (!isMounted) {
          return;
        }

        const nextState = publicInviteErrorState(validateError);
        if (nextState === "invalid") {
          window.sessionStorage.removeItem(PENDING_INVITE_CODE_STORAGE_KEY);
        }
        setState(nextState);
        setMessage(publicInviteErrorMessage(validateError));
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedCode]);

  const startGitHub = () => {
    window.sessionStorage.setItem(PENDING_INVITE_CODE_STORAGE_KEY, resolvedCode);
    setIsRedirecting(true);
    window.location.assign(githubStartUrl);
  };

  const isLoading = state === "loading";
  const canStart = state === "valid" && !isRedirecting;

  return (
    <main className="min-h-screen bg-app px-4 py-6 text-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Link href="/" className={buttonClasses({ variant: "ghost", size: "sm" })}>
            Back home
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
              dotti.work invite
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              You received an invite to find open source projects that fit you.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Continue with GitHub to create your account and start onboarding
              with the invite code already attached.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                disabled={!canStart}
                onClick={startGitHub}
              >
                {isLoading || isRedirecting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <GitHubIcon width={18} height={18} />
                )}
                {isRedirecting
                  ? "Opening GitHub"
                  : isLoading
                    ? "Checking invite"
                    : "Continue with GitHub"}
              </Button>
              <Link
                href="/login?return_to=%2Fonboarding"
                className={buttonClasses({ variant: "outline", size: "lg" })}
                onClick={() => {
                  if (state !== "valid") {
                    window.sessionStorage.removeItem(PENDING_INVITE_CODE_STORAGE_KEY);
                  }
                }}
              >
                Sign up without invite
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div
              className={
                state === "valid"
                  ? "flex size-12 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-600 dark:text-emerald-200"
                  : state === "loading"
                    ? "flex size-12 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500"
                    : "flex size-12 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-200"
              }
            >
              {state === "loading" ? (
                <Loader2 className="animate-spin" size={24} />
              ) : state === "valid" ? (
                <ShieldCheck size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <h2 className="mt-5 text-xl font-semibold">
              {state === "valid"
                ? "Invite ready"
                : state === "loading"
                  ? "Validating invite"
                  : "Invite unavailable"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {message}
            </p>

            {state === "valid" ? (
              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  {invite?.inviter?.avatar_url ? (
                    <GitHubAvatar
                      avatarUrl={invite.inviter.avatar_url}
                      label={inviterName ?? "Inviter"}
                      size="sm"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
                      <UserRound size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950 dark:text-white">
                      {inviterName ?? "A dotti.work member"}
                    </p>
                    <p className="truncate text-zinc-500 dark:text-zinc-400">
                      Invite code {invite?.code ?? resolvedCode}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {state === "invalid" || state === "rate-limited" || state === "error" ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/" className={buttonClasses({ variant: "outline" })}>
                  Learn about dotti.work
                </Link>
                {state === "error" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
