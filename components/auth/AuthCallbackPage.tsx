"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, GitBranch, Loader2, XCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { buildGitHubOAuthStartUrl, normalizeReturnTo } from "@/services/dotti/client";
import { PENDING_INVITE_CODE_STORAGE_KEY } from "@/services/dotti/invites";
import { inviteHref } from "@/utils/inviteRoutes";
import { useAuth } from "@/hooks/useAuth";

type CallbackState = "checking" | "success" | "error";

export function AuthCallbackPage({
  status,
  reason,
  returnTo,
}: {
  status?: string;
  reason?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const requestedStatus = status ?? searchParams.get("status") ?? undefined;
  const requestedReason = reason ?? searchParams.get("reason") ?? undefined;
  const requestedReturnTo = returnTo ?? searchParams.get("return_to") ?? undefined;
  const safeReturnTo = useMemo(
    () => normalizeReturnTo(requestedReturnTo, "/matches"),
    [requestedReturnTo],
  );
  const [state, setState] = useState<CallbackState>(
    requestedStatus === "success" ? "checking" : "error",
  );
  const [pendingInviteCode] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem(PENDING_INVITE_CODE_STORAGE_KEY),
  );
  const [message, setMessage] = useState(
    requestedStatus === "error"
      ? requestedReason || "GitHub sign-in was canceled or rejected."
      : requestedStatus === "success"
        ? "Confirming your dotti.work session..."
        : "The GitHub callback did not include a success status.",
  );

  useEffect(() => {
    if (requestedStatus !== "success") {
      return;
    }

    let isMounted = true;

    refreshSession()
      .then((session) => {
        if (!isMounted) {
          return;
        }

        if (!session) {
          throw new Error("Session not found after GitHub returned.");
        }

        setState("success");
        setMessage("Session confirmed. Redirecting...");
        window.sessionStorage.removeItem(PENDING_INVITE_CODE_STORAGE_KEY);

        const shouldFinishOnboarding = safeReturnTo.startsWith(
          "/onboarding?complete=1",
        );

        window.setTimeout(() => {
          router.replace(
            session.profile.onboarding_completed || shouldFinishOnboarding
              ? safeReturnTo
              : "/onboarding",
          );
        }, 450);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setState("error");
        setMessage("We could not confirm the API session after GitHub returned.");
      });

    return () => {
      isMounted = false;
    };
  }, [refreshSession, requestedStatus, router, safeReturnTo]);

  const retryUrl = pendingInviteCode
    ? inviteHref(pendingInviteCode)
    : buildGitHubOAuthStartUrl(safeReturnTo);

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-zinc-950 dark:text-white">
      <section className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-coral-400/10 text-coral-500">
          {state === "checking" ? (
            <Loader2 className="animate-spin" size={28} />
          ) : state === "success" ? (
            <CheckCircle2 size={28} />
          ) : (
            <XCircle size={28} />
          )}
        </div>
        <h1 className="mt-5 text-2xl font-semibold">
          {state === "error" ? "GitHub sign-in needs attention" : "GitHub connected"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {message}
        </p>

        {state === "error" ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={retryUrl} className={buttonClasses()}>
              <GitBranch size={17} />
              {pendingInviteCode ? "Return to invite" : "Try GitHub again"}
            </a>
            <Link
              href="/login"
              className={buttonClasses({ variant: "outline" })}
            >
              Back to login
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
