"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";

export function ProfileSummaryCard() {
  const { profile } = useProfile();
  const selectedTechs = profile?.technologies.slice(0, 4) ?? [];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
          <UserRound size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
            {profile?.name || "Open source explorer"}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {profile?.role || "Profile not completed"}
          </p>
        </div>
      </div>
      {profile ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="accent">{profile.seniority}</Badge>
            {selectedTechs.map((tech) => (
              <Badge key={`${tech.name}-${tech.level}`}>{tech.name}</Badge>
            ))}
          </div>
          <Link
            href="/profile"
            className="mt-4 inline-flex text-xs font-medium text-coral-600 hover:text-coral-500 dark:text-coral-300"
          >
            Edit profile
          </Link>
        </>
      ) : (
        <Link href="/onboarding" className="mt-4 block">
          <Button type="button" size="sm" className="w-full">
            Create profile
          </Button>
        </Link>
      )}
    </div>
  );
}
