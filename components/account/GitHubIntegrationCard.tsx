"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Unplug } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GitHubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import {
  buildGitHubOAuthStartUrl,
  DottiApiError,
} from "@/services/dotti/client";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import {
  disconnectGitHubIntegration,
  getGitHubIntegrationStatus,
  syncGitHubIntegration,
} from "@/services/dotti/githubIntegration";
import type { ApiGitHubIntegrationStatus } from "@/services/dotti/types";
import { useToast } from "@/contexts/ToastContext";

type GitHubIntegrationCardProps = {
  className?: string;
  returnTo?: string;
  showSignOut?: boolean;
};

type ActionState = "idle" | "syncing" | "disconnecting";
type LoadState = "idle" | "loading" | "error";

function messageForGitHubError(error: unknown, fallback: string) {
  if (error instanceof DottiApiError) {
    if (error.status === 403) {
      return "This session cannot manage the GitHub integration.";
    }

    if (error.status === 404) {
      return "No GitHub integration was found for this account.";
    }

  }

  return apiErrorMessage(error, {
    fallback,
    unauthorized: "Your session expired. Sign in with GitHub again.",
    validation: "The GitHub integration request was rejected by the API.",
    unavailable: "GitHub or the API is temporarily unavailable. Please retry shortly.",
  });
}

function disconnectedIntegration(): ApiGitHubIntegrationStatus {
  return {
    connected: false,
    login: null,
    provider: "github",
    scope: null,
    token_last_verified_at: null,
  };
}

function formatVerifiedAt(value?: string | null) {
  if (!value) {
    return "Not verified yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function GitHubIntegrationCard({
  className,
  returnTo = "/settings",
  showSignOut = false,
}: GitHubIntegrationCardProps) {
  const {
    session,
    status: authStatus,
    refreshSession,
  } = useAuth();
  const { showToast } = useToast();
  const [integration, setIntegration] =
    useState<ApiGitHubIntegrationStatus | null>(session?.github ?? null);
  const [loadState, setLoadState] = useState<LoadState>(
    authStatus === "authenticated" ? "loading" : "idle",
  );
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const isAuthenticated = authStatus === "authenticated";
  const isCheckingSession = authStatus === "checking";
  const isLoading = isCheckingSession || loadState === "loading";
  const isBusy = actionState !== "idle";
  const sessionGitHub = session?.github ?? null;

  const currentIntegration = useMemo<ApiGitHubIntegrationStatus>(() => {
    if (!isAuthenticated) {
      return disconnectedIntegration();
    }

    return integration ?? sessionGitHub ?? disconnectedIntegration();
  }, [integration, isAuthenticated, sessionGitHub]);

  const isConnected = Boolean(currentIntegration.connected);
  const login =
    currentIntegration.login ?? session?.user.login ?? session?.user.display_name ?? null;
  const displayName = session?.user.display_name ?? login ?? "GitHub user";

  useEffect(() => {
    let isCurrent = true;

    if (authStatus !== "authenticated") {
      Promise.resolve().then(() => {
        if (!isCurrent) {
          return;
        }

        setIntegration(null);
        setLoadState("idle");
        setError(null);
      });

      return () => {
        isCurrent = false;
      };
    }

    Promise.resolve()
      .then(() => {
        if (!isCurrent) {
          return null;
        }

        setIntegration(sessionGitHub);
        setLoadState("loading");
        setError(null);
        return getGitHubIntegrationStatus();
      })
      .then((nextIntegration) => {
        if (!isCurrent || !nextIntegration) {
          return;
        }

        setIntegration(nextIntegration);
        setLoadState("idle");
      })
      .catch((statusError: unknown) => {
        if (!isCurrent) {
          return;
        }

        setLoadState("error");
        setError(
          messageForGitHubError(
            statusError,
            "Could not load the GitHub integration status.",
          ),
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [authStatus, sessionGitHub]);

  const reloadStatus = useCallback(async () => {
    if (authStatus !== "authenticated") {
      return;
    }

    setLoadState("loading");
    setError(null);

    try {
      const nextIntegration = await getGitHubIntegrationStatus();
      setIntegration(nextIntegration);
      setLoadState("idle");
    } catch (statusError) {
      setLoadState("error");
      setError(
        messageForGitHubError(
          statusError,
          "Could not load the GitHub integration status.",
        ),
      );
    }
  }, [authStatus]);

  const handleConnect = useCallback(() => {
    window.location.assign(buildGitHubOAuthStartUrl(returnTo));
  }, [returnTo]);

  const handleSync = useCallback(async () => {
    if (authStatus !== "authenticated") {
      handleConnect();
      return;
    }

    setActionState("syncing");
    setError(null);

    try {
      await syncGitHubIntegration();
      const [nextSession, nextIntegration] = await Promise.all([
        refreshSession(),
        getGitHubIntegrationStatus(),
      ]);

      setIntegration(nextIntegration ?? nextSession?.github ?? sessionGitHub);
      showToast("GitHub profile synced.", "success");
    } catch (syncError) {
      const message = messageForGitHubError(
        syncError,
        "Could not sync the GitHub profile.",
      );
      setError(message);
      showToast(message, "error");
    } finally {
      setActionState("idle");
    }
  }, [authStatus, handleConnect, refreshSession, sessionGitHub, showToast]);

  const handleDisconnect = useCallback(async () => {
    if (authStatus !== "authenticated") {
      handleConnect();
      return;
    }

    setActionState("disconnecting");
    setError(null);

    try {
      const response = await disconnectGitHubIntegration();
      await refreshSession().catch(() => null);
      setIntegration({
        ...disconnectedIntegration(),
        connected: response.connected,
      });
      showToast("GitHub integration disconnected.", "success");
    } catch (disconnectError) {
      const message = messageForGitHubError(
        disconnectError,
        "Could not disconnect the GitHub integration.",
      );
      setError(message);
      showToast(message, "error");
    } finally {
      setActionState("idle");
      setDisconnectOpen(false);
    }
  }, [authStatus, handleConnect, refreshSession, showToast]);

  return (
    <AnimatedSection
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            GitHub
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Manage the GitHub account used by the API for OAuth, profile sync,
            and repository recommendations.
          </p>
        </div>
        <Badge
          tone={
            isLoading
              ? "neutral"
              : isConnected
                ? "success"
                : loadState === "error"
                  ? "danger"
                  : "warning"
          }
        >
          {isLoading
            ? "Checking"
            : isConnected
              ? "Connected"
              : loadState === "error"
                ? "Needs attention"
                : "Disconnected"}
        </Badge>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
              <GitHubIcon width={17} height={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-950 dark:text-white">
                {isAuthenticated ? displayName : "No GitHub account connected"}
              </p>
              <p className="truncate">
                {isConnected && login
                  ? `@${login}`
                  : isAuthenticated
                    ? "Authenticated session without an active GitHub integration"
                    : "Sign in with GitHub to connect this account"}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Last verified
            </p>
            <p className="mt-1 text-zinc-800 dark:text-zinc-100">
              {formatVerifiedAt(currentIntegration.token_last_verified_at)}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <div className="min-w-0">
            <p>{error}</p>
            {isAuthenticated ? (
              <button
                type="button"
                className="mt-2 font-medium underline underline-offset-4"
                onClick={() => {
                  void reloadStatus();
                }}
              >
                Retry status
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {isConnected ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy || isLoading}
              onClick={() => {
                void handleSync();
              }}
            >
              <RefreshCw
                size={16}
                className={actionState === "syncing" ? "animate-spin" : undefined}
              />
              {actionState === "syncing" ? "Syncing" : "Sync GitHub profile"}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isBusy || isLoading}
              onClick={() => setDisconnectOpen(true)}
            >
              <Unplug size={16} />
              {actionState === "disconnecting"
                ? "Disconnecting"
                : "Disconnect GitHub"}
            </Button>
          </>
        ) : (
          <Button type="button" disabled={isBusy || isLoading} onClick={handleConnect}>
            <GitHubIcon width={16} height={16} />
            Connect GitHub
          </Button>
        )}
        {showSignOut ? (
          <LogoutButton label="Sign out from this session" variant="outline" />
        ) : null}
      </div>

      <ConfirmDialog
        open={disconnectOpen}
        title="Disconnect GitHub?"
        description="This revokes the GitHub integration stored by the API. Your local session will be refreshed after the disconnect finishes."
        confirmLabel={
          actionState === "disconnecting" ? "Disconnecting" : "Disconnect GitHub"
        }
        onConfirm={() => {
          void handleDisconnect();
        }}
        onClose={() => setDisconnectOpen(false)}
      />
    </AnimatedSection>
  );
}
