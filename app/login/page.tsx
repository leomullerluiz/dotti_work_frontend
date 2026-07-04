import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppProviders } from "@/contexts/AppProviders";

export const metadata: Metadata = {
  title: "Login - dotti.work",
};

export default function LoginRoute() {
  return (
    <AppProviders>
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </AppProviders>
  );
}
