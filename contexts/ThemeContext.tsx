"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/data/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ThemeMode } from "@/types";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: Exclude<ThemeMode, "system">;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialResolvedTheme(): Exclude<ThemeMode, "system"> {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(STORAGE_KEYS.theme, "system");
  const [resolvedTheme, setResolvedTheme] =
    useState<Exclude<ThemeMode, "system">>(getInitialResolvedTheme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldUseDark = theme === "dark" || (theme === "system" && media.matches);
      const nextResolvedTheme = shouldUseDark ? "dark" : "light";

      root.classList.toggle("dark", shouldUseDark);
      root.style.colorScheme = nextResolvedTheme;
      setResolvedTheme(nextResolvedTheme);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const value = useMemo(
    () => ({ resolvedTheme, setTheme, theme }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
