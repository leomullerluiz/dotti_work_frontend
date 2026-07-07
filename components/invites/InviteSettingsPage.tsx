"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  Check,
  Copy,
  Link2,
  Loader2,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import {
  createMyInviteLink,
  listMyInviteLinks,
  type InviteLink,
  type InviteSummary,
} from "@/services/dotti/invites";

const REFRESH_AFTER_MS = 15000;

type LoadState = "loading" | "idle" | "error";
type PendingAction = "generate" | "copy" | "share" | "refresh" | null;

function inviteErrorMessage(error: unknown, fallback: string) {
  return apiErrorMessage(error, {
    fallback,
    unauthorized: "Your session expired. Sign in again to manage invites.",
    rateLimited: "Invite actions are temporarily rate limited. Try again soon.",
    unavailable: "Invites are temporarily unavailable. Please retry shortly.",
  });
}

function isActiveInvite(link: InviteLink) {
  return link.status === "active";
}

function referralCopy(count: number) {
  if (count === 1) {
    return "1 person signed up through your link";
  }

  return `${count} people signed up through your link`;
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function InviteSettingsPage() {
  const { showToast } = useToast();
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [summary, setSummary] = useState<InviteSummary>({
    effective_referrals: 0,
  });
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const lastLoadedAtRef = useRef(0);

  const activeLink = useMemo(
    () => links.find(isActiveInvite) ?? null,
    [links],
  );
  const latestLink = links[0] ?? null;
  const effectiveReferrals = summary.effective_referrals ?? 0;

  const loadInvites = useCallback(
    async ({
      ensureActiveLink,
      silent,
    }: {
      ensureActiveLink: boolean;
      silent?: boolean;
    }) => {
      if (!silent) {
        setLoadState("loading");
      }
      setError(null);

      try {
        const response = await listMyInviteLinks();
        const existingLinks = response.invite_links ?? [];
        const existingActive = existingLinks.find(isActiveInvite);

        setLinks(existingLinks);
        setSummary(response.summary ?? { effective_referrals: 0 });

        if (!existingActive && ensureActiveLink) {
          setPendingAction("generate");
          const created = await createMyInviteLink();
          setLinks([created.invite_link, ...existingLinks]);
        }

        lastLoadedAtRef.current = Date.now();
        setLoadState("idle");
      } catch (loadError) {
        const message = inviteErrorMessage(
          loadError,
          "Could not load your invite link.",
        );
        setError(message);
        setLoadState("error");
        if (!silent) {
          showToast(message, "error");
        }
      } finally {
        setPendingAction(null);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void Promise.resolve().then(() =>
      loadInvites({ ensureActiveLink: true }),
    );
  }, [loadInvites]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (
        document.visibilityState !== "visible" ||
        Date.now() - lastLoadedAtRef.current < REFRESH_AFTER_MS
      ) {
        return;
      }

      void loadInvites({ ensureActiveLink: false, silent: true });
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadInvites]);

  const generateLink = async () => {
    setPendingAction("generate");
    setError(null);

    try {
      const created = await createMyInviteLink();
      setLinks((current) => [created.invite_link, ...current]);
      showToast("Invite link ready.");
    } catch (generateError) {
      const message = inviteErrorMessage(
        generateError,
        "Could not generate an invite link.",
      );
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingAction(null);
    }
  };

  const refreshInvites = async () => {
    setPendingAction("refresh");
    await loadInvites({ ensureActiveLink: false });
  };

  const copyLink = async () => {
    if (!activeLink) {
      return;
    }

    setPendingAction("copy");

    try {
      await copyToClipboard(activeLink.url);
      showToast("Invite link copied.");
    } catch {
      showToast("Could not copy the invite link.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const shareLink = async () => {
    if (!activeLink) {
      return;
    }

    setPendingAction("share");

    try {
      const shareText = `I am using dotti.work to find open source projects to contribute to. Join here: ${activeLink.url}`;

      if (navigator.share) {
        await navigator.share({
          title: "Join me on dotti.work",
          text: shareText,
          url: activeLink.url,
        });
        showToast("Invite link shared.");
      } else {
        await copyToClipboard(activeLink.url);
        showToast("Sharing is not available here, so the link was copied.");
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }

      showToast("Could not share the invite link.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const isLoading = loadState === "loading";
  const isBusy = isLoading || pendingAction !== null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Invites"
        title="Invite people to dotti.work"
        description="Share your link. When someone creates an account from it, the API records the referral."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => {
              void refreshInvites();
            }}
          >
            <RefreshCw
              size={16}
              className={pendingAction === "refresh" ? "animate-spin" : undefined}
            />
            Refresh
          </Button>
        }
      />

      {error ? (
        <AnimatedDiv className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          <p>{error}</p>
        </AnimatedDiv>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Effective referrals"
          value={isLoading ? <Loader2 className="animate-spin" size={22} /> : effectiveReferrals}
          helper={referralCopy(effectiveReferrals)}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Active invite"
          value={activeLink ? "Ready" : isLoading ? "Loading" : "Missing"}
          helper={activeLink ? `Code ${activeLink.code}` : "Generate a link to start sharing"}
          icon={<Link2 size={20} />}
        />
        <StatCard
          label="Badges"
          value="Prepared"
          helper="Invite badge progress will appear here when the API exposes it"
          icon={<Award size={20} />}
        />
      </div>

      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Your invite link
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Keep sharing the same active link. Copying or sharing it does not
              change referral counts locally.
            </p>
          </div>
          <Badge
            tone={
              isLoading
                ? "neutral"
                : activeLink
                  ? "success"
                  : latestLink?.status === "revoked"
                    ? "warning"
                    : "danger"
            }
          >
            {isLoading
              ? "Loading"
              : activeLink
                ? "Active"
                : latestLink?.status === "revoked"
                  ? "Revoked"
                  : "No active link"}
          </Badge>
        </div>

        {isLoading ? (
          <div className="mt-6 flex min-h-32 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
            <Loader2 className="mr-2 animate-spin" size={18} />
            Loading invite link
          </div>
        ) : activeLink ? (
          <>
            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input
                readOnly
                value={activeLink.url}
                className="min-h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                aria-label="Invite link"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => {
                  void copyLink();
                }}
              >
                {pendingAction === "copy" ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                Copy
              </Button>
              <Button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  void shareLink();
                }}
              >
                <Share2 size={16} />
                Share
              </Button>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <InviteDetail label="Status" value={activeLink.status} />
              <InviteDetail label="Recorded signups" value={activeLink.uses_count} />
              <InviteDetail
                label="Expires"
                value={activeLink.expires_at ?? "No expiration"}
              />
            </dl>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No active invite link"
              description={
                latestLink?.status === "revoked"
                  ? "Your previous invite link was revoked. Generate a new one if the API allows it."
                  : "Generate an invite link to start sharing dotti.work with other contributors."
              }
              action={
                <Button
                  type="button"
                  disabled={pendingAction === "generate"}
                  onClick={() => {
                    void generateLink();
                  }}
                >
                  {pendingAction === "generate" ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Link2 size={16} />
                  )}
                  Generate link
                </Button>
              }
            />
          </div>
        )}
      </AnimatedSection>
    </AppShell>
  );
}

function InviteDetail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <AnimatedDiv className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20">
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-zinc-800 dark:text-zinc-100">{value}</dd>
    </AnimatedDiv>
  );
}
