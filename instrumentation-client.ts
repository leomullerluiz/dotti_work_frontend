// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { hasLocalOptionalConsent } from "@/services/dotti/consentStorage";

const allowAnalytics = hasLocalOptionalConsent("analytics");
const allowSentryReplay = hasLocalOptionalConsent("sentry_replay");

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: allowSentryReplay ? [Sentry.replayIntegration()] : [],

  tracesSampleRate: allowAnalytics ? 1 : 0,
  enableLogs: allowAnalytics,

  replaysSessionSampleRate: allowSentryReplay ? 0.1 : 0,
  replaysOnErrorSampleRate: allowSentryReplay ? 1.0 : 0,

  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
