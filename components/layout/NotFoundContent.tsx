"use client";

import { usePathname } from "next/navigation";
import { PublicUserProfilePage } from "@/components/public-profile/PublicUserProfilePage";
import { parsePublicProfilePath } from "@/utils/publicProfileRoutes";
import { NotFoundActions } from "./NotFoundActions";

export function NotFoundContent() {
  const pathname = usePathname();
  const publicProfileRoute = parsePublicProfilePath(pathname);

  if (publicProfileRoute) {
    return <PublicUserProfilePage login={publicProfileRoute.login} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 text-center">
      <div className="max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          This page does not exist or may have moved.
        </p>
        <NotFoundActions />
      </div>
    </main>
  );
}
