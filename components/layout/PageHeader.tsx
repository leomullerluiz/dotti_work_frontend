import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
