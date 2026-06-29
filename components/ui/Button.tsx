import type { ComponentProps, ReactNode } from "react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-coral-500 text-white shadow-lg shadow-coral-500/20 hover:bg-coral-400 focus-visible:ring-coral-400",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10",
  danger:
    "bg-red-500 text-white shadow-lg shadow-red-500/15 hover:bg-red-400 focus-visible:ring-red-400",
  outline:
    "border border-zinc-200 bg-white/70 text-zinc-800 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex transform-gpu items-center justify-center gap-2 rounded-lg font-medium transition-[transform,box-shadow,color,background-color,border-color] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:scale-100 disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: Omit<ComponentProps<typeof AnimateButton>, "asChild" | "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <AnimateButton
      className={buttonClasses({ variant, size, className })}
      hoverScale={props.disabled ? 1 : 1.03}
      tapScale={props.disabled ? 1 : 0.97}
      {...props}
    >
      {children}
    </AnimateButton>
  );
}
