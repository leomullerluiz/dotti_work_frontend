"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/utils/cn";

const avatarSizes = {
  sm: "size-10 rounded-lg",
  md: "size-12 rounded-xl",
  lg: "size-20 rounded-2xl",
} as const;

export function GitHubAvatar({
  avatarUrl,
  label,
  size = "md",
  className,
}: {
  avatarUrl?: string | null;
  label: string;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const githubAvatarUrl = avatarUrl?.trim();

  return (
    <div
      aria-label={githubAvatarUrl ? `${label} GitHub avatar` : undefined}
      role={githubAvatarUrl ? "img" : undefined}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-coral-400/10 text-coral-500 shadow-sm dark:border-white/10",
        avatarSizes[size],
        className,
      )}
    >
      {githubAvatarUrl ? (
        <span
          className="block size-full bg-cover bg-center"
          style={{
            backgroundImage: `url("${githubAvatarUrl.replace(/"/g, "%22")}")`,
          }}
        />
      ) : (
        <UserRound size={size === "lg" ? 34 : 20} />
      )}
    </div>
  );
}
