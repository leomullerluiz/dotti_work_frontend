"use client";

import Link from "next/link";
import { GitHubAvatar } from "@/components/account/GitHubAvatar";
import { AnimatedDiv } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export function ProfileSummaryCard() {
  const { profile } = useProfile();
  const { session } = useAuth();
  const selectedTechs = profile?.technologies.slice(0, 4) ?? [];
  const profileName =
    profile?.name || session?.user.display_name || session?.user.login || "Open source explorer";

  return (
    <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <GitHubAvatar
          avatarUrl={session?.user.avatar_url}
          label={profileName}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
            {profileName}
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
    </AnimatedDiv>
  );
}
