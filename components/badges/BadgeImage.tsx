"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  Bookmark,
  CheckCircle2,
  Compass,
  Flame,
  GitPullRequest,
  LockKeyhole,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  bookmark: Bookmark,
  "check-circle": CheckCircle2,
  compass: Compass,
  flame: Flame,
  github: Award,
  "git-pull-request": GitPullRequest,
  sparkles: Sparkles,
};

export function BadgeImage({
  imageUrl,
  imageAlt,
  icon,
  earned,
  secret,
  className,
}: {
  imageUrl?: string | null;
  imageAlt?: string | null;
  icon?: string | null;
  level?: string;
  earned?: boolean;
  secret?: boolean;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = secret && !earned ? LockKeyhole : iconMap[icon ?? ""] ?? Award;
  const normalizedImageUrl = imageUrl?.trim();
  const showImage = Boolean(normalizedImageUrl) && !imageFailed && (!secret || earned);

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400",
        earned
          ? "border-coral-300 bg-coral-500/10 text-coral-600 dark:border-coral-400/30 dark:text-coral-200"
          : "",
        className,
      )}
    >
      {showImage && normalizedImageUrl ? (
        <Image
          src={normalizedImageUrl}
          alt={imageAlt ?? "Achievement badge"}
          width={60}
          height={60}
          unoptimized
          className={cn("size-10 rounded-md object-contain", earned ? "" : "grayscale")}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Icon size={24} aria-hidden="true" />
      )}
    </div>
  );
}
