"use client";

import { useMemo, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useConsents } from "@/contexts/ConsentContext";
import { useAuth } from "@/hooks/useAuth";
import {
  CONSENT_TYPES,
  consentByType,
  consentLabels,
  isOptionalConsent,
} from "@/services/dotti/consentPreferences";
import type { ApiConsentType } from "@/services/dotti/types";
import { useToast } from "@/contexts/ToastContext";

function formatConsentDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function PrivacyConsentSettings() {
  const { status } = useAuth();
  const {
    consents,
    error,
    grantConsentType,
    hasGrantedConsent,
    isLoading,
    retryConsents,
    revokeConsentType,
  } = useConsents();
  const { showToast } = useToast();
  const [pendingType, setPendingType] = useState<ApiConsentType | null>(null);
  const consentMap = useMemo(() => consentByType(consents), [consents]);
  const isAuthenticated = status === "authenticated";

  async function toggleConsent(type: ApiConsentType) {
    setPendingType(type);

    try {
      if (hasGrantedConsent(type)) {
        if (!isOptionalConsent(type)) {
          showToast("Essential consent cannot be revoked in the app.", "info");
          return;
        }

        await revokeConsentType(type);
        showToast(`${consentLabels[type].title} revoked.`, "info");
        return;
      }

      await grantConsentType(type, "settings");
      showToast(`${consentLabels[type].title} granted.`, "success");
    } finally {
      setPendingType(null);
    }
  }

  return (
    <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Privacy consent
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Manage LGPD consent records stored by the API. Non-essential
            analytics, marketing, and Sentry Replay stay disabled unless granted.
          </p>
        </div>
        <Badge tone={error ? "danger" : isLoading ? "neutral" : "success"}>
          {error ? "Needs attention" : isLoading ? "Loading" : "Ready"}
        </Badge>
      </div>

      {!isAuthenticated ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          Sign in to load and update API consent records.
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void retryConsents();
            }}
          >
            <RefreshCw size={15} />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {CONSENT_TYPES.map((type) => {
          const consent = consentMap.get(type);
          const granted = consent?.status === "granted";
          const optional = isOptionalConsent(type);
          const disabled =
            !isAuthenticated ||
            isLoading ||
            pendingType === type ||
            (!optional && granted);

          return (
            <AnimatedDiv
              key={type}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
                      <ShieldCheck size={16} />
                    </div>
                    <h3 className="font-semibold text-zinc-950 dark:text-white">
                      {consentLabels[type].title}
                    </h3>
                    <Badge tone={granted ? "success" : "warning"}>
                      {granted ? "Granted" : consent ? "Revoked" : "Missing"}
                    </Badge>
                    {!optional ? <Badge tone="blue">Required</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {consentLabels[type].description}
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
                    <div>
                      <dt className="font-medium uppercase tracking-[0.14em]">
                        Source
                      </dt>
                      <dd className="mt-1">{consent?.source ?? "None"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium uppercase tracking-[0.14em]">
                        Granted at
                      </dt>
                      <dd className="mt-1">
                        {formatConsentDate(consent?.created_at)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium uppercase tracking-[0.14em]">
                        Revoked at
                      </dt>
                      <dd className="mt-1">
                        {formatConsentDate(consent?.revoked_at)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <label className="inline-flex h-11 min-w-36 cursor-pointer items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-coral-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">
                  <span>{granted ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    className="size-4 accent-coral-500"
                    checked={granted}
                    disabled={disabled}
                    onChange={() => {
                      void toggleConsent(type);
                    }}
                  />
                </label>
              </div>
            </AnimatedDiv>
          );
        })}
      </div>
    </AnimatedSection>
  );
}
