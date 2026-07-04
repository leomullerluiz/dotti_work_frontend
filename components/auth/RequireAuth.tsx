"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

function getLoginHref(pathname: string | null) {
  const returnTo = pathname && pathname.startsWith("/") ? pathname : "/matches";
  return `/login?return_to=${encodeURIComponent(returnTo)}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, error, refreshSession } = useAuth();
  const loginHref = getLoginHref(pathname);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(loginHref);
    }
  }, [loginHref, router, status]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-zinc-950 dark:text-white">
        <section className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">
            Could not verify your session
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {error ??
              "The API session check failed. Try again or start a new GitHub login."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                void refreshSession().catch(() => undefined);
              }}
            >
              Retry
            </Button>
            <Link href={loginHref} className={buttonClasses({ variant: "outline" })}>
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-8 text-zinc-950 dark:text-white">
      <section className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Loader2 className="mx-auto animate-spin text-coral-500" size={28} />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {status === "unauthenticated"
            ? "Redirecting to login..."
            : "Checking your session..."}
        </p>
      </section>
    </main>
  );
}
