import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
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
          This route is not part of the dotti.work prototype.
        </p>
        <Link href="/matches" className={buttonClasses({ className: "mt-6" })}>
          Go to matches
        </Link>
      </div>
    </main>
  );
}
