"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, FileText, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button, buttonClasses } from "@/components/ui/Button";
import { buildGitHubOAuthStartUrl, normalizeReturnTo } from "@/services/dotti/client";
import { PENDING_INVITE_CODE_STORAGE_KEY } from "@/services/dotti/invites";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "../ui/Icons";

export function LoginPage({ returnTo }: { returnTo?: string }) {
  const searchParams = useSearchParams();
  const requestedReturnTo = returnTo ?? searchParams.get("return_to") ?? undefined;
  const [pendingInviteCode] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem(PENDING_INVITE_CODE_STORAGE_KEY),
  );
  const fallbackReturnTo = pendingInviteCode ? "/onboarding" : "/matches";
  const safeReturnTo = useMemo(
    () => normalizeReturnTo(requestedReturnTo, fallbackReturnTo),
    [fallbackReturnTo, requestedReturnTo],
  );
  const { session, status } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      return;
    }

    window.location.replace(
      session.profile.onboarding_completed ? safeReturnTo : "/onboarding",
    );
  }, [safeReturnTo, session, status]);

  const startGitHubLogin = () => {
    setIsRedirecting(true);
    window.location.assign(
      buildGitHubOAuthStartUrl(safeReturnTo, {
        inviteCode: pendingInviteCode,
      }),
    );
  };

  const isChecking = status === "checking" || status === "authenticated";
  const isBusy = isChecking || isRedirecting;

  return (
    <main className="min-h-screen bg-app px-4 py-6 text-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Link
            href="/"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            Back home
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
              GitHub OAuth
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Continue with the GitHub account you use for open source.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              dotti.work uses GitHub only to create your local API session and
              prepare repository recommendations. No password is created here.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={startGitHubLogin}
                disabled={isBusy}
              >
                {isBusy ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Icons.GitHubIcon />
                )}
                {isChecking
                  ? "Checking session"
                  : isRedirecting
                    ? "Opening GitHub"
                    : "Continue with GitHub"}
              </Button>
              <Link
                href="/onboarding"
                className={buttonClasses({ variant: "outline", size: "lg" })}
              >
                Preview onboarding
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="font-semibold">Session handled by the API</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    After GitHub approves the OAuth flow, the backend stores the
                    GitHub token server-side and sends this app an HttpOnly
                    session cookie.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
                Next destination:{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {safeReturnTo}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-white/10 dark:bg-black/20">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
                  <FileText size={21} />
                </div>
                <div>
                  <h2 className="font-semibold">Before continuing</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    By continuing with GitHub, you acknowledge that dotti.work
                    may process your GitHub profile, technical preferences, and
                    repository activity according to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
                    >
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
