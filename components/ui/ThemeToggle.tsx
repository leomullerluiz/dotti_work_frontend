"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { ThemeToggler } from "@/components/animate-ui/primitives/effects/theme-toggler";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/types";
import { cn } from "@/utils/cn";

const options: Array<{ value: ThemeMode; label: string; icon: typeof Moon }> = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, toggleTheme }) => (
        <div className="inline-grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/[0.04]">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = effective === option.value;

            return (
              <AnimateButton
                key={option.value}
                type="button"
                onClick={() => toggleTheme(option.value)}
                className={cn(
                  "flex transform-gpu items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-[transform,box-shadow,color,background-color] hover:scale-[1.03] active:scale-95",
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                )}
                aria-pressed={isActive}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{option.label}</span>
              </AnimateButton>
            );
          })}
        </div>
      )}
    </ThemeToggler>
  );
}
