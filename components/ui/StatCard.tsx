"use client";

import type { ReactNode } from "react";
import { Shine } from "@/components/animate-ui/primitives/effects/shine";
import { AnimatedDiv } from "./AnimatedSurface";

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Shine asChild enableOnHover color="rgba(255,111,97,0.22)" opacity={0.65}>
      <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-coral-500/5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
            {value}
          </div>
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
            {icon}
          </div>
        ) : null}
      </div>
      {helper ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">{helper}</p>
      ) : null}
      </AnimatedDiv>
    </Shine>
  );
}
