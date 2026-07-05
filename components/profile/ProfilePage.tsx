"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, RotateCcw, Upload } from "lucide-react";
import { GitHubIntegrationCard } from "@/components/account/GitHubIntegrationCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportImportDataDialog } from "@/components/ui/ExportImportDataDialog";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { StatCard } from "@/components/ui/StatCard";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useProfile } from "@/hooks/useProfile";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import type { TechCategory, UserTechnology } from "@/types";

export function ProfilePage() {
  const {
    profile,
    isLoading,
    error,
    retryProfile,
    resetProfile,
    exportProfile,
    importProfile,
  } = useProfile();
  const { savedProjects } = useSavedProjects();
  const { ignoredProjectIds, projects } = useMatches();
  const { history } = useHistory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const groupedTechnologies = useMemo<Partial<Record<TechCategory, UserTechnology[]>>>(
    () => {
    if (!profile) {
      return {};
    }

    return profile.technologies.reduce<Partial<Record<TechCategory, UserTechnology[]>>>(
      (acc, technology) => {
        acc[technology.category] = [...(acc[technology.category] ?? []), technology];
        return acc;
      },
      {},
    );
  }, [profile]);

  const stats = {
    opened: history.filter((event) => event.type === "Opened GitHub").length,
    working: savedProjects.filter((project) => project.status === "Working").length,
    contributed: savedProjects.filter((project) => project.status === "Contributed")
      .length,
  };

  if (isLoading) {
    return (
      <AppShell>
        <SkeletonProjectCard />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonProjectCard key={index} />
          ))}
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <EmptyState
          title="Could not load profile"
          description={error}
          action={
            <Button
              type="button"
              onClick={() => {
                void retryProfile();
              }}
            >
              Retry
            </Button>
          }
        />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          title="No profile yet"
          description="Complete onboarding to create a local technical profile for recommendations."
          action={
            <Link href="/onboarding" className={buttonClasses()}>
              Start onboarding
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Profile"
        title={profile.name || "Technical profile"}
        description={`${profile.role} - ${profile.seniority} - ${profile.goal}`}
        actions={
          <>
            <Link href="/onboarding" className={buttonClasses({ variant: "outline" })}>
              <RotateCcw size={16} />
              Restart onboarding
            </Link>
            <Button type="button" variant="outline" onClick={exportProfile}>
              <Download size={16} />
              Export profile JSON
            </Button>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
              <Upload size={16} />
              Import profile JSON
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
              Reset profile
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Projects analyzed" value={projects.length} />
        <StatCard label="Projects saved" value={savedProjects.length} />
        <StatCard label="Projects ignored" value={ignoredProjectIds.length} />
        <StatCard label="GitHub links opened" value={stats.opened} />
        <StatCard label="In progress" value={stats.working} />
        <StatCard label="Completed" value={stats.contributed} />
      </div>

      <GitHubIntegrationCard className="mt-5" returnTo="/profile" />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Professional details
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <ProfileRow label="Role" value={profile.role} />
            <ProfileRow label="Seniority" value={profile.seniority} />
            <ProfileRow label="Goal" value={profile.goal} />
            <ProfileRow label="Updated" value={new Date(profile.updatedAt).toLocaleString()} />
          </dl>
        </AnimatedSection>

        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Contribution preferences
          </h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <ProfileRow label="Difficulty" value={profile.preferences.difficulty} />
            <ProfileRow label="Project size" value={profile.preferences.projectSize} />
            <ProfileRow label="Activity" value={profile.preferences.activityLevel} />
            <ProfileRow label="Language" value={profile.preferences.preferredLanguage} />
            <ProfileRow label="Organization" value={profile.preferences.organizationType} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.preferences.contributionTypes.map((type) => (
              <Badge key={type} tone="accent">
                {type}
              </Badge>
            ))}
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Selected technologies
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.entries(groupedTechnologies) as Array<
            [TechCategory, UserTechnology[]]
          >).map(([category, technologies]) => (
            <AnimatedDiv
              key={category}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                {category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <Badge key={technology.name} tone="blue">
                    {technology.name} - {technology.level}
                  </Badge>
                ))}
              </div>
            </AnimatedDiv>
          ))}
        </div>
      </AnimatedSection>

      <ExportImportDataDialog
        open={dialogOpen}
        title="Import or inspect profile JSON"
        exportLabel="Current profile"
        importLabel="Import profile"
        exportValue={profile}
        onImport={importProfile}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Reset profile?"
        description="This clears only your technical profile. Saved projects and history stay untouched."
        confirmLabel="Reset profile"
        onConfirm={() => {
          void resetProfile();
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | number }) {
  return (
    <AnimatedDiv className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20">
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-zinc-800 dark:text-zinc-100">{value}</dd>
    </AnimatedDiv>
  );
}
