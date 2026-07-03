"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Button } from "@/components/ui/Button";

class SentryPublicRouteTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryPublicRouteTestError";
  }
}

export function SentryExamplePage() {
  const [eventId, setEventId] = useState<string | null>(null);

  const captureHandledError = () => {
    const nextEventId = Sentry.captureException(
      new SentryPublicRouteTestError(
        "Handled Sentry test from the public /sentry-example-page route.",
      ),
      {
        tags: {
          route: "/sentry-example-page",
          test: "public-static-route",
        },
        extra: {
          source: "manual-button",
        },
      },
    );

    setEventId(nextEventId);
  };

  const throwUnhandledError = () => {
    window.setTimeout(() => {
      throw new SentryPublicRouteTestError(
        "Unhandled Sentry test from the public /sentry-example-page route.",
      );
    }, 0);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Sentry"
        title="Public Sentry test"
        description="Trigger a browser-side event from a static public route without requiring a backend API."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-600 dark:bg-coral-500/10 dark:text-coral-300">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                Send a test event
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Use the handled error for a clean validation event. Use the
                unhandled error only when you want to confirm global browser
                error capture.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={captureHandledError}>
              <CheckCircle2 size={16} />
              Capture handled error
            </Button>
            <Button type="button" variant="outline" onClick={throwUnhandledError}>
              <AlertTriangle size={16} />
              Throw unhandled error
            </Button>
          </div>

          {eventId ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              Event sent to Sentry with id:
              <span className="ml-2 font-mono text-xs">{eventId}</span>
            </div>
          ) : null}
        </AnimatedSection>

        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Deployment notes
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            This app is built with Next static export, so backend API routes are
            generated at build time instead of running on the public host.
          </p>
          <a
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-coral-600 hover:text-coral-500 dark:text-coral-300 dark:hover:text-coral-200"
            href="https://docs.sentry.io/platforms/javascript/guides/nextjs/"
            rel="noreferrer"
            target="_blank"
          >
            Sentry Next.js docs
            <ExternalLink size={15} />
          </a>
        </AnimatedSection>
      </div>
    </AppShell>
  );
}
