import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackPage } from "@/components/auth/AuthCallbackPage";

export const metadata: Metadata = {
  title: "GitHub callback - dotti.work",
};

export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackPage />
    </Suspense>
  );
}
