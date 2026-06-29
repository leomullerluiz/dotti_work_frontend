import type { ReactNode } from "react";
import { Shine } from "@/components/animate-ui/primitives/effects/shine";
import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "blue";

const tones: Record<BadgeTone, string> = {
  neutral:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300",
  accent:
    "border-coral-400/30 bg-coral-400/10 text-coral-700 dark:text-coral-200",
  success:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
  warning:
    "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200",
  danger: "border-red-400/30 bg-red-400/10 text-red-700 dark:text-red-200",
  blue: "border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <Shine
      asChild
      enableOnHover
      color="rgba(255,255,255,0.9)"
      opacity={0.35}
      duration={700}
    >
      <span
        className={cn(
          "inline-flex transform-gpu items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-[transform,box-shadow,color,background-color,border-color] hover:-translate-y-px active:scale-95",
          tones[tone],
          className,
        )}
      >
        {children}
      </span>
    </Shine>
  );
}
