import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white/70 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
      <Loader2 className="mr-2 animate-spin" size={18} />
      {label}
    </div>
  );
}
