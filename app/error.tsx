"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-lg rounded-xl border border-red-400/20 bg-white p-6 shadow-xl dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          Runtime error
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {error.message || "The application could not render this route."}
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
