export function SkeletonProjectCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex animate-pulse gap-4">
        <div className="size-11 rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-white/10" />
          <div className="h-3 w-4/6 rounded bg-zinc-200 dark:bg-white/10" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="h-6 w-24 rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
