"use client";

import { useMemo, useState } from "react";
import { GitBranch, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportImportDataDialog } from "@/components/ui/ExportImportDataDialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { STORAGE_KEYS } from "@/data/constants";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useProfile } from "@/hooks/useProfile";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { useTheme } from "@/hooks/useTheme";
import type { LocalAppData } from "@/types";
import { downloadJson } from "@/utils/format";
import { useToast } from "@/contexts/ToastContext";

export function SettingsPage() {
  const { profile, resetProfile } = useProfile();
  const { savedProjects, clearSaved } = useSavedProjects();
  const { history, clearHistory } = useHistory();
  const { ignoredProjectIds, clearIgnored } = useMatches();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const snapshot = useMemo<LocalAppData>(
    () => ({
      profile,
      savedProjects,
      ignoredProjectIds,
      history,
      theme,
    }),
    [history, ignoredProjectIds, profile, savedProjects, theme],
  );

  const importAppData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as LocalAppData;
      window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(parsed.profile ?? null));
      window.localStorage.setItem(
        STORAGE_KEYS.savedProjects,
        JSON.stringify(parsed.savedProjects ?? []),
      );
      window.localStorage.setItem(
        STORAGE_KEYS.ignoredProjects,
        JSON.stringify(parsed.ignoredProjectIds ?? []),
      );
      window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(parsed.history ?? []));
      if (parsed.theme) {
        window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(parsed.theme));
      }
      showToast("Application data imported. Reloading...", "info");
      window.setTimeout(() => window.location.reload(), 600);
      return true;
    } catch {
      showToast("Could not import application JSON", "error");
      return false;
    }
  };

  const resetApplication = () => {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    showToast("Application reset. Reloading...", "info");
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Application settings"
        description="Manage appearance, local data, and future GitHub connection preferences."
      />

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Appearance
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Choose a local theme preference. Light mode is the default.
          </p>
          <div className="mt-5">
            <ThemeToggle />
          </div>
        </AnimatedSection>

        <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                GitHub
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                GitHub OAuth and API-backed recommendations are planned for a future
                integration. This prototype uses mocks only.
              </p>
            </div>
            <Badge tone="warning">Coming soon</Badge>
          </div>
          <Button type="button" variant="outline" className="mt-5" disabled>
            <GitBranch size={16} />
            Connect GitHub
          </Button>
        </AnimatedSection>
      </div>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Data
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Everything is stored in browser localStorage. Export before clearing if you
          want to keep a backup.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadJson("dotti-local-data.json", snapshot)}
          >
            Export local data
          </Button>
          <Button type="button" variant="outline" onClick={() => setDataDialogOpen(true)}>
            <Upload size={16} />
            Import local data
          </Button>
          <Button type="button" variant="outline" onClick={clearSaved}>
            Clear saved projects
          </Button>
          <Button type="button" variant="outline" onClick={clearIgnored}>
            Clear ignored projects
          </Button>
          <Button type="button" variant="outline" onClick={clearHistory}>
            Clear history
          </Button>
          <Button type="button" variant="outline" onClick={resetProfile}>
            Reset profile
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setResetOpen(true)}
            className="sm:col-span-2 lg:col-span-3"
          >
            <Trash2 size={16} />
            Reset application
          </Button>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Local storage summary
        </h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
          <Summary label="Profile" value={profile ? "Ready" : "Missing"} />
          <Summary label="Saved" value={savedProjects.length} />
          <Summary label="Ignored" value={ignoredProjectIds.length} />
          <Summary label="History" value={history.length} />
        </div>
      </AnimatedSection>

      <ExportImportDataDialog
        open={dataDialogOpen}
        title="Import or inspect local app data"
        exportLabel="Current local data"
        importLabel="Import local data"
        exportValue={snapshot}
        onImport={importAppData}
        onClose={() => setDataDialogOpen(false)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset the entire application?"
        description="This removes profile, saved projects, ignored projects, history, theme, and filters from localStorage."
        confirmLabel="Reset application"
        onConfirm={resetApplication}
        onClose={() => setResetOpen(false)}
      />
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <AnimatedDiv className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-zinc-950 dark:text-white">{value}</p>
    </AnimatedDiv>
  );
}
