import type { Metadata } from "next";
import { SentryExamplePage } from "@/components/sentry/SentryExamplePage";

export const metadata: Metadata = {
  title: "Sentry test - dotti.work",
  description: "Public static route for validating Sentry client-side events.",
};

export const dynamic = "force-static";

export default function SentryExampleRoute() {
  return <SentryExamplePage />;
}
