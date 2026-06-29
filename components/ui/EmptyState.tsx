import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { AnimatedDiv } from "./AnimatedSurface";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AnimatedDiv className="rounded-xl border border-dashed border-zinc-300 bg-white/70 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
        <Inbox size={22} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </AnimatedDiv>
  );
}
