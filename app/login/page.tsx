import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Login - dotti.work",
};

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
