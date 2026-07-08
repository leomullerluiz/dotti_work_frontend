"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  ExternalLink,
  Loader2,
  RotateCcw,
  Share2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PublicProfileContent } from "@/components/public-profile/PublicProfileContent";
import { AnimatedSection } from "@/components/ui/AnimatedSurface";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { DottiApiError } from "@/services/dotti/client";
import {
  getMyPublicProfilePreview,
  updatePublicProfileSettings,
} from "@/services/dotti/publicProfile";
import type { ApiPublicProfilePreview } from "@/services/dotti/types";
import { fallbackPublicProfileUrl } from "@/utils/publicProfileRoutes";

type PreviewState = "loading" | "ready" | "unauthorized" | "error";

function previewErrorState(error: unknown): PreviewState {
  return error instanceof DottiApiError && error.status === 401
    ? "unauthorized"
    : "error";
}

function previewErrorMessage(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Could not load your public profile preview.",
    unauthorized: "Your session expired. Sign in again to manage your public profile.",
    rateLimited: "Public profile settings are temporarily rate limited. Try again shortly.",
    unavailable: "Public profile settings are temporarily unavailable.",
  });
}

export function PublicProfileSettingsPanel() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<ApiPublicProfilePreview | null>(null);
  const [state, setState] = useState<PreviewState>("loading");
  const [message, setMessage] = useState("Loading public profile preview...");
  const [pendingToggle, setPendingToggle] = useState(false);

  const loadPreview = useCallback(() => {
    setState("loading");
    setMessage("Loading public profile preview...");

    getMyPublicProfilePreview()
      .then((response) => {
        setPreview(response);
        setState("ready");
        setMessage("");
      })
      .catch((error) => {
        setPreview(null);
        setState(previewErrorState(error));
        setMessage(previewErrorMessage(error));
      });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadPreview);
  }, [loadPreview]);

  const shareUrl = useMemo(() => {
    if (!preview) {
      return "";
    }

    return (
      preview.share_url ??
      preview.profile.share.canonical_url ??
      fallbackPublicProfileUrl(preview.profile.profile.login)
    );
  }, [preview]);

  const togglePublicProfile = async () => {
    if (!preview || pendingToggle) {
      return;
    }

    const nextValue = !preview.is_public;
    setPendingToggle(true);

    try {
      await updatePublicProfileSettings(nextValue);
      await getMyPublicProfilePreview().then((response) => {
        setPreview(response);
        setState("ready");
      });
      showToast(nextValue ? "Public profile enabled" : "Public profile disabled");
    } catch (error) {
      const nextMessage = previewErrorMessage(error);
      showToast(nextMessage, "error");
      setMessage(nextMessage);
      setState(previewErrorState(error));
    } finally {
      setPendingToggle(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Public profile link copied");
    } catch {
      inputRef.current?.focus();
      inputRef.current?.select();
      showToast("Select the link field to copy it.", "info");
    }
  };

  const isLoading = state === "loading";
  const isPublic = Boolean(preview?.is_public);

  return (
    <>
      <AnimatedSection className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Public profile
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Manage the shareable version of your profile and preview what visitors can see.
            </p>
          </div>

          <Button
            type="button"
            variant={isPublic ? "secondary" : "outline"}
            disabled={!preview || pendingToggle || isLoading}
            onClick={() => {
              void togglePublicProfile();
            }}
          >
            {pendingToggle ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isPublic ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
            {isPublic ? "Public" : "Private"}
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
            <Loader2 className="animate-spin text-coral-500" size={18} />
            {message}
          </div>
        ) : null}

        {state === "unauthorized" || state === "error" ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            <p>{message}</p>
            {state === "error" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={loadPreview}
              >
                <RotateCcw size={16} />
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}

        {state === "ready" && preview ? (
          <div className="mt-5 space-y-4">
            {preview.warnings?.length ? (
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-700 dark:text-amber-200">
                {preview.warnings[0]?.message}
              </div>
            ) : null}

            {isPublic && shareUrl ? (
              <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                <label className="sr-only" htmlFor="public-profile-share-url">
                  Public profile link
                </label>
                <input
                  ref={inputRef}
                  id="public-profile-share-url"
                  readOnly
                  value={shareUrl}
                  className="field-input"
                />
                <Button type="button" variant="outline" onClick={copyShareUrl}>
                  <Copy size={16} />
                  Copy
                </Button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClasses({ variant: "outline" })}
                >
                  <ExternalLink size={16} />
                  Open
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
                <Share2 size={18} className="text-coral-500" />
                Enable the public profile to generate a shareable link.
              </div>
            )}
          </div>
        ) : null}
      </AnimatedSection>

      {state === "ready" && preview ? (
        <div className="mt-5">
          <PublicProfileContent data={preview.profile} compact />
        </div>
      ) : null}
    </>
  );
}
