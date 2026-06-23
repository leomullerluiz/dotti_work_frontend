import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="dotti.work home">
      <span className="flex size-9 items-center justify-center rounded-lg bg-coral-500 text-sm font-bold text-white shadow-lg shadow-coral-500/20">
        d
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
        dotti.work
      </span>
    </Link>
  );
}
