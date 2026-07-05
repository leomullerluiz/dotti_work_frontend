"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useConsents } from "@/contexts/ConsentContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/ToastContext";

export function AuthenticatedConsentBanner() {
  const { status } = useAuth();
  const {
    error,
    grantConsentType,
    hasGrantedConsent,
    isLoading,
  } = useConsents();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const requiresNotice = useMemo(
    () =>
      status === "authenticated" &&
      !isLoading &&
      (!hasGrantedConsent("essential") ||
        !hasGrantedConsent("github_oauth_notice")),
    [hasGrantedConsent, isLoading, status],
  );

  if (!requiresNotice || dismissed) {
    return null;
  }

  async function saveRequiredConsent(includeDiagnostics: boolean) {
    setIsSaving(true);

    try {
      await grantConsentType("essential", "cookie_banner");
      await grantConsentType("github_oauth_notice", "login_notice");

      if (includeDiagnostics) {
        await Promise.all([
          grantConsentType("analytics", "cookie_banner"),
          grantConsentType("sentry_replay", "cookie_banner"),
        ]);
      }

      showToast("Privacy preferences saved.", "success");
      setDismissed(true);
    } catch {
      // The context already publishes a recoverable error toast.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/15 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-zinc-950 dark:text-white">
            Privacy preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Save required account consent and choose whether optional analytics
            and Sentry Replay diagnostics may be used. You can change this in{" "}
            <Link
              href="/settings"
              className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            >
              Settings
            </Link>
            .
          </p>
          {error ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-44">
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={() => {
              void saveRequiredConsent(true);
            }}
          >
            Accept optional
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={() => {
              void saveRequiredConsent(false);
            }}
          >
            Essential only
          </Button>
        </div>
      </div>
    </div>
  );
}
