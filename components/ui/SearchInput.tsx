"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-500 shadow-sm transition focus-within:border-coral-400 focus-within:ring-2 focus-within:ring-coral-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400",
        className,
      )}
    >
      <Search size={16} aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}
    </label>
  );
}
