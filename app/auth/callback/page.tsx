import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackPage } from "@/components/auth/AuthCallbackPage";
import { AppProviders } from "@/contexts/AppProviders";

export const metadata: Metadata = {
  title: "GitHub callback - dotti.work",
};

export default function AuthCallbackRoute() {
  return (
    <AppProviders>
      <Suspense fallback={null}>
        <AuthCallbackPage />
      </Suspense>
    </AppProviders>
  );
}
