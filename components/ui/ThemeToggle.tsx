"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/types";
import { cn } from "@/utils/cn";

const options: Array<{ value: ThemeMode; label: string; icon: typeof Moon }> = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/[0.04]">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition",
              theme === option.value
                ? "bg-white text-zinc-950 shadow-sm dark:bg-white/10 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
            )}
            aria-pressed={theme === option.value}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
