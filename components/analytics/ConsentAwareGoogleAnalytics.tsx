"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { hasLocalOptionalConsent } from "@/services/dotti/consentStorage";

const GOOGLE_ANALYTICS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const GOOGLE_ANALYTICS_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
const GOOGLE_ANALYTICS_DISABLE_KEY = `ga-disable-${GOOGLE_ANALYTICS_ID}`;
const consentStoreEventName = "dotti-consent-change";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    __dottiGoogleAnalyticsInitialized?: boolean;
  }
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(consentStoreEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(consentStoreEventName, onStoreChange);
  };
}

function getAnalyticsConsentSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return hasLocalOptionalConsent("analytics");
}

function getServerAnalyticsConsentSnapshot() {
  return false;
}

function setGoogleAnalyticsDisabled(disabled: boolean) {
  (window as unknown as Record<string, boolean>)[
    GOOGLE_ANALYTICS_DISABLE_KEY
  ] = disabled;
}

function configureGoogleAnalytics() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  setGoogleAnalyticsDisabled(false);
  window.gtag("consent", "update", { analytics_storage: "granted" });

  if (!window.__dottiGoogleAnalyticsInitialized) {
    window.gtag("js", new Date());
    window.__dottiGoogleAnalyticsInitialized = true;
  }

  window.gtag("config", GOOGLE_ANALYTICS_ID);
}

function disableGoogleAnalytics() {
  setGoogleAnalyticsDisabled(true);
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

export function ConsentAwareGoogleAnalytics() {
  const allowAnalytics = useSyncExternalStore(
    subscribeToConsent,
    getAnalyticsConsentSnapshot,
    getServerAnalyticsConsentSnapshot,
  );

  useEffect(() => {
    if (!allowAnalytics) {
      disableGoogleAnalytics();
      return;
    }

    configureGoogleAnalytics();
  }, [allowAnalytics]);

  if (!allowAnalytics) {
    return null;
  }

  return (
    <Script
      id="google-analytics-gtag"
      src={GOOGLE_ANALYTICS_SRC}
      strategy="afterInteractive"
    />
  );
}
