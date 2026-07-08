"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, LogOut, Trash2, Upload, UserPlus } from "lucide-react";
import { GitHubIntegrationCard } from "@/components/account/GitHubIntegrationCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrivacyConsentSettings } from "@/components/privacy/PrivacyConsentSettings";
import { PublicProfileSettingsPanel } from "@/components/public-profile/PublicProfileSettingsPanel";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportImportDataDialog } from "@/components/ui/ExportImportDataDialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { STORAGE_KEYS } from "@/data/constants";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import { useMatches } from "@/hooks/useMatches";
import { useProfile } from "@/hooks/useProfile";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { useTheme } from "@/hooks/useTheme";
import {
  localAppDataToApiImportInput,
  type LocalDataImportConversion,
} from "@/services/dotti/adapters";
import {
  deleteMyAccount,
  exportMyData,
  importLocalData,
} from "@/services/dotti/account";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { listTechnologies } from "@/services/dotti/profile";
import type { LocalAppData } from "@/types";
import { downloadJson } from "@/utils/format";
import { useToast } from "@/contexts/ToastContext";

const DELETE_CONFIRMATION = "DELETE MY ACCOUNT";

function messageForAccountError(error: unknown, fallback: string) {
  return apiErrorMessage(error, {
    fallback,
    unauthorized: "Your session expired. Sign in again to manage account data.",
    validation: "Some imported data was rejected by the API.",
  });
}

function skippedSummary(conversion: LocalDataImportConversion) {
  const parts = [
    conversion.skipped.technologies.length
      ? `${conversion.skipped.technologies.length} technologies`
      : null,
    conversion.skipped.repositoryStates.length
      ? `${conversion.skipped.repositoryStates.length} repository states`
      : null,
    conversion.skipped.history.length
      ? `${conversion.skipped.history.length} history events`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export function SettingsPage() {
  const router = useRouter();
  const {
    status: authStatus,
    refreshSession,
    logoutAll,
  } = useAuth();
  const { profile, resetProfile, retryProfile } = useProfile();
  const {
    savedProjects,
    clearSaved,
    retryUserRepositories,
  } = useSavedProjects();
  const { history, clearHistory, retryHistory } = useHistory();
  const {
    ignoredProjectIds,
    clearIgnored,
    retryMatches,
  } = useMatches();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [accountImportOpen, setAccountImportOpen] = useState(false);
  const [resetLocalOpen, setResetLocalOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | "export"
    | "import"
    | "delete"
    | "logout-all"
    | "reset-local"
    | null
  >(null);

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

  const isAuthenticated = authStatus === "authenticated";

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

  const clearLocalData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
  };

  const resetLocalApplication = () => {
    setPendingAction("reset-local");
    clearLocalData();
    showToast("Local browser data cleared. Reloading...", "info");
    window.setTimeout(() => window.location.reload(), 600);
  };

  const exportAccountData = async () => {
    if (!isAuthenticated) {
      downloadJson("dotti-local-data.json", snapshot);
      showToast("Local data exported", "info");
      return;
    }

    setPendingAction("export");
    setAccountError(null);

    try {
      const exportedData = await exportMyData();
      downloadJson("dotti-account-data.json", exportedData);
      showToast("Account data exported");
    } catch (exportError) {
      const message = messageForAccountError(exportError, "Could not export account data.");
      setAccountError(message);
      showToast(message, "error");
    } finally {
      setPendingAction(null);
    }
  };

  const importAccountData = async (json: string) => {
    if (!isAuthenticated) {
      return importAppData(json);
    }

    setPendingAction("import");
    setAccountError(null);

    try {
      const parsed = JSON.parse(json) as Partial<LocalAppData>;
      const localData: LocalAppData = {
        profile: parsed.profile ?? null,
        savedProjects: parsed.savedProjects ?? [],
        ignoredProjectIds: parsed.ignoredProjectIds ?? [],
        history: parsed.history ?? [],
        theme: parsed.theme ?? theme,
      };

      const catalog = await listTechnologies({ active: true, limit: 100 });
      const conversion = localAppDataToApiImportInput(localData, catalog.items);
      const importedData = await importLocalData(conversion.input);
      const skipped = skippedSummary(conversion);
      const backendSkipped =
        importedData.skipped && Object.keys(importedData.skipped).length > 0
          ? " The API also reported skipped items."
          : "";

      await Promise.all([
        retryProfile(),
        retryUserRepositories(),
        retryHistory(),
        Promise.resolve(retryMatches()),
      ]);

      showToast(
        skipped
          ? `Account data imported. Skipped locally: ${skipped}.${backendSkipped}`
          : `Account data imported.${backendSkipped}`,
        skipped || backendSkipped ? "info" : "success",
      );
      return true;
    } catch (importError) {
      const message = messageForAccountError(importError, "Could not import account data.");
      setAccountError(message);
      showToast(message, "error");
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const handleLogoutAll = async () => {
    setPendingAction("logout-all");
    setAccountError(null);

    try {
      await logoutAll();
      showToast("All sessions revoked", "info");
      router.replace("/login");
    } catch (logoutError) {
      const message = messageForAccountError(logoutError, "Could not revoke all sessions.");
      setAccountError(message);
      showToast(message, "error");
    } finally {
      setPendingAction(null);
      setLogoutAllOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== DELETE_CONFIRMATION) {
      showToast("Type the confirmation phrase before deleting the account.", "error");
      return;
    }

    setPendingAction("delete");
    setAccountError(null);

    try {
      const response = await deleteMyAccount();
      if (!response.deleted) {
        throw new Error("The API did not confirm account deletion.");
      }

      clearLocalData();
      await refreshSession().catch(() => null);
      showToast("Account deleted. Local browser data was cleared.", "info");
      router.replace("/login");
    } catch (deleteError) {
      const message = messageForAccountError(deleteError, "Could not delete the account.");
      setAccountError(message);
      showToast(message, "error");
    } finally {
      setPendingAction(null);
      setDeleteOpen(false);
      setDeleteConfirmation("");
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Application settings"
        description="Manage appearance, local data, GitHub session, and account preferences."
        actions={
          <Link href="/settings/invites" className={buttonClasses({ variant: "outline" })}>
            <UserPlus size={16} />
            Invites
          </Link>
        }
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

        <GitHubIntegrationCard returnTo="/settings" showSignOut />
      </div>

      <PublicProfileSettingsPanel />

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Account data
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Authenticated exports and imports use the API account endpoints. Local
          browser data can be imported into the account when signed in.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            disabled={pendingAction === "export"}
            onClick={() => {
              void exportAccountData();
            }}
          >
            <Download size={16} />
            {isAuthenticated ? "Export account data" : "Export local data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pendingAction === "import"}
            onClick={() => setAccountImportOpen(true)}
          >
            <Upload size={16} />
            {isAuthenticated ? "Import local data to account" : "Import local data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isAuthenticated || pendingAction === "logout-all"}
            onClick={() => setLogoutAllOpen(true)}
          >
            <LogOut size={16} />
            Log out all sessions
          </Button>
        </div>
        {accountError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            {accountError}
          </div>
        ) : null}
      </AnimatedSection>

      <PrivacyConsentSettings />

      <AnimatedSection className="mt-5 rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-500/20 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Delete account
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          This deletes the authenticated account through the API and clears local
          browser data after the backend confirms deletion.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={DELETE_CONFIRMATION}
            className="min-h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
          />
          <Button
            type="button"
            variant="danger"
            disabled={
              !isAuthenticated ||
              deleteConfirmation !== DELETE_CONFIRMATION ||
              pendingAction === "delete"
            }
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} />
            Delete account
          </Button>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Data maintenance
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          When you are signed in, saved projects, ignored projects, history, and
          profile actions use the API. Local import, export, and browser cleanup
          remain available for fallback data.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadJson("dotti-local-data.json", snapshot)}
          >
            <Download size={16} />
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
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void resetProfile();
            }}
          >
            Reset profile
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pendingAction === "reset-local"}
            onClick={() => setResetLocalOpen(true)}
            className="sm:col-span-2 lg:col-span-3"
          >
            <Trash2 size={16} />
            Clear local browser data
          </Button>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Data summary
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

      <ExportImportDataDialog
        open={accountImportOpen}
        title={
          isAuthenticated
            ? "Import local data into account"
            : "Import or inspect local app data"
        }
        exportLabel="Current local data"
        importLabel={
          isAuthenticated ? "Import into API account" : "Import local data"
        }
        exportValue={snapshot}
        onImport={importAccountData}
        onClose={() => setAccountImportOpen(false)}
      />

      <ConfirmDialog
        open={resetLocalOpen}
        title="Clear local browser data?"
        description="This removes profile, saved projects, ignored projects, history, theme, filters, and pending onboarding from localStorage only."
        confirmLabel="Clear local data"
        onConfirm={resetLocalApplication}
        onClose={() => setResetLocalOpen(false)}
      />

      <ConfirmDialog
        open={logoutAllOpen}
        title="Log out all sessions?"
        description="This revokes every active API session for your account, including this browser."
        confirmLabel={
          pendingAction === "logout-all" ? "Revoking" : "Log out all sessions"
        }
        onConfirm={() => {
          void handleLogoutAll();
        }}
        onClose={() => setLogoutAllOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete account permanently?"
        description="The API will delete your account and revoke sessions. This browser's local data will be cleared after the backend confirms deletion."
        confirmLabel={
          pendingAction === "delete" ? "Deleting" : "Delete account"
        }
        onConfirm={() => {
          void handleDeleteAccount();
        }}
        onClose={() => setDeleteOpen(false)}
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
