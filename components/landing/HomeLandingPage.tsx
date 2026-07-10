"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "./LandingPage";

export function HomeLandingPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/matches");
    }
  }, [router, status]);

  if (status === "unauthenticated" || status === "error") {
    return <LandingPage />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-zinc-950 dark:text-white">
      <section className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Loader2 className="mx-auto animate-spin text-coral-500" size={28} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Checking your session...
        </p>
      </section>
    </main>
  );
}
