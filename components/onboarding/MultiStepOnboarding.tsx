"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import {
  ACTIVITY_LEVELS,
  CONTRIBUTION_TYPES,
  DEFAULT_PREFERENCES,
  LOADING_MESSAGES,
  ORGANIZATION_TYPES,
  PROFESSIONAL_ROLES,
  PROFILE_GOALS,
  PROJECT_SIZES,
  SENIORITY_LEVELS,
  STORAGE_KEYS,
} from "@/data/constants";
import { getAuthenticatedUser } from "@/services/dotti/auth";
import {
  buildGitHubOAuthStartUrl,
  isUnauthorizedError,
} from "@/services/dotti/client";
import { submitOnboardingToApi } from "@/services/dotti/onboarding";
import { useProfile } from "@/hooks/useProfile";
import type {
  ActivityLevel,
  ContributionType,
  DeveloperProfile,
  DifficultyLevel,
  MatchPreferences,
  OrganizationType,
  ProjectSize,
  SeniorityLevel,
  UserTechnology,
} from "@/types";
import { cn } from "@/utils/cn";
import {
  AnimatedAside,
  AnimatedDiv,
  AnimatedHeader,
  AnimatedSection,
} from "../ui/AnimatedSurface";
import { Button } from "../ui/Button";
import { TechnologySelector } from "./TechnologySelector";

const steps = ["Profile", "Stack", "Preferences", "Matching"];
const preferredLanguages = [
  "TypeScript",
  "JavaScript",
  "PHP",
  "Python",
  "Java",
  "Vue",
  "Any",
];
const difficulties: DifficultyLevel[] = ["Beginner", "Easy", "Medium", "Hard"];

type ProfileStepState = {
  name: string;
  role: string;
  seniority: SeniorityLevel | "";
  goal: string;
};

type CompletionStatus = "idle" | "syncing" | "redirecting" | "done" | "error";

function readPendingOnboarding() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const snapshot = window.localStorage.getItem(STORAGE_KEYS.pendingOnboarding);
    return snapshot ? (JSON.parse(snapshot) as DeveloperProfile) : null;
  } catch {
    return null;
  }
}

function persistPendingOnboarding(profile: DeveloperProfile) {
  window.localStorage.setItem(
    STORAGE_KEYS.pendingOnboarding,
    JSON.stringify(profile),
  );
}

function clearPendingOnboarding() {
  window.localStorage.removeItem(STORAGE_KEYS.pendingOnboarding);
}

export function MultiStepOnboarding({
  completeAfterOAuth = false,
}: {
  completeAfterOAuth?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldCompleteAfterOAuth =
    completeAfterOAuth || searchParams.get("complete") === "1";
  const { profile, saveProfile } = useProfile();
  const savedOnce = useRef(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>("idle");
  const [completionDetail, setCompletionDetail] = useState(
    "Preparing your profile and preferences...",
  );
  const [profileState, setProfileState] = useState<ProfileStepState>({
    name: profile?.name ?? "",
    role: profile?.role ?? "",
    seniority: profile?.seniority ?? "",
    goal: profile?.goal ?? "",
  });
  const [technologies, setTechnologies] = useState<UserTechnology[]>(
    profile?.technologies ?? [],
  );
  const [preferences, setPreferences] = useState<MatchPreferences>(
    profile?.preferences ?? DEFAULT_PREFERENCES,
  );

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const buildProfile = useCallback(
    (): DeveloperProfile => ({
      name: profileState.name.trim() || undefined,
      role: profileState.role,
      seniority: profileState.seniority as SeniorityLevel,
      goal: profileState.goal,
      technologies,
      preferences,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    }),
    [preferences, profileState, technologies],
  );

  const redirectToGitHub = useCallback(() => {
    setCompletionStatus("redirecting");
    setCompletionDetail("Opening GitHub to finish creating your account...");
    window.setTimeout(() => {
      window.location.assign(
        buildGitHubOAuthStartUrl("/onboarding?complete=1"),
      );
    }, 700);
  }, []);

  const completeOnboarding = useCallback(
    async (nextProfile: DeveloperProfile) => {
      setError("");
      setCompletionStatus("syncing");
      setCompletionDetail("Saving your onboarding with the dotti.work API...");

      try {
        await getAuthenticatedUser();
        const result = await submitOnboardingToApi(nextProfile);
        const skippedCount = result.skippedTechnologies.length;
        const skippedDetail =
          skippedCount > 0
            ? ` ${skippedCount} selected ${
                skippedCount === 1 ? "technology was" : "technologies were"
              } not in the API catalog.`
            : "";
        const reusedMatchesMessage = result.refreshSkippedReason
          ? `Profile registered. ${result.refreshSkippedReason}${skippedDetail}`
          : `Profile registered. Existing matches will be reused for now.${skippedDetail}`;

        clearPendingOnboarding();
        setCompletionStatus("done");
        setCompletionDetail(
          result.refreshStarted
            ? `Profile registered. Your first matches are being prepared.${skippedDetail}`
            : reusedMatchesMessage,
        );

        window.setTimeout(() => {
          router.push("/matches");
        }, 1000);
      } catch (submissionError) {
        if (isUnauthorizedError(submissionError)) {
          persistPendingOnboarding(nextProfile);
          redirectToGitHub();
          return;
        }

        setCompletionStatus("error");
        setCompletionDetail(
          "Your local profile is saved, but the API registration did not finish.",
        );
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Could not finish onboarding with the API.",
        );
      }
    },
    [redirectToGitHub, router],
  );

  useEffect(() => {
    if (!shouldCompleteAfterOAuth || savedOnce.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const pendingProfile = readPendingOnboarding() ?? profile;

      if (!pendingProfile) {
        setCompletionStatus("error");
        setCompletionDetail("No pending onboarding data was found in this browser.");
        setError("Restart onboarding so we can save your profile with GitHub.");
        return;
      }

      savedOnce.current = true;
      setStep(3);
      saveProfile(pendingProfile);
      void completeOnboarding(pendingProfile);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [completeOnboarding, profile, saveProfile, shouldCompleteAfterOAuth]);

  useEffect(() => {
    if (step !== 3 || savedOnce.current) {
      return;
    }

    savedOnce.current = true;
    const nextProfile = buildProfile();

    saveProfile(nextProfile);
    persistPendingOnboarding(nextProfile);
    void completeOnboarding(nextProfile);
  }, [buildProfile, completeOnboarding, saveProfile, step]);

  useEffect(() => {
    if (step !== 3 || completionStatus === "done" || completionStatus === "error") {
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        current + 1 >= LOADING_MESSAGES.length ? current : current + 1,
      );
    }, 850);

    return () => {
      window.clearInterval(interval);
    };
  }, [completionStatus, step]);

  const retryCompletion = () => {
    const pendingProfile = readPendingOnboarding() ?? profile ?? buildProfile();
    persistPendingOnboarding(pendingProfile);
    void completeOnboarding(pendingProfile);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!profileState.role || !profileState.seniority || !profileState.goal) {
        setError("Choose your role, experience level, and goal to continue.");
        return false;
      }
    }

    if (step === 1 && technologies.length === 0) {
      setError("Select at least one technology from your stack.");
      return false;
    }

    if (step === 2 && preferences.contributionTypes.length === 0) {
      setError("Select at least one contribution type.");
      return false;
    }

    setError("");
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setError("");

    if (step === 0) {
      router.push("/");
      return;
    }

    setStep((current) => Math.max(current - 1, 0));
  };

  return (
    <div className="min-h-screen bg-app px-4 py-6 text-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <AnimatedHeader className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
                dotti.work onboarding
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Tell us what you want to contribute to.
              </h1>
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Step {step + 1} of {steps.length}
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-coral-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {steps.map((label, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium",
                  index <= step
                    ? "border-coral-400/40 bg-coral-400/10 text-coral-700 dark:text-coral-200"
                    : "border-zinc-200 text-zinc-500 dark:border-white/10",
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </AnimatedHeader>

        {error ? (
          <AnimatedDiv className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </AnimatedDiv>
        ) : null}

        {step === 0 ? (
          <ProfileStep value={profileState} onChange={setProfileState} />
        ) : null}
        {step === 1 ? (
          <TechnologySelector selected={technologies} onChange={setTechnologies} />
        ) : null}
        {step === 2 ? (
          <PreferencesStep value={preferences} onChange={setPreferences} />
        ) : null}
        {step === 3 ? (
          <MatchingStep
            detail={completionDetail}
            message={LOADING_MESSAGES[messageIndex]}
            status={completionStatus}
            onRetry={retryCompletion}
            onSignIn={redirectToGitHub}
          />
        ) : null}

        {step < 3 ? (
          <footer className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={back}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button type="button" onClick={next}>
              {step === 2 ? "Find matches" : "Continue"}
              <ArrowRight size={16} />
            </Button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function ProfileStep({
  value,
  onChange,
}: {
  value: ProfileStepState;
  onChange: (value: ProfileStepState) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold">Technical profile</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Name (optional)">
            <input
              value={value.name}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
              placeholder="Ada Lovelace"
              className="field-input"
            />
          </Field>
          <Field label="Current role">
            <select
              value={value.role}
              onChange={(event) => onChange({ ...value, role: event.target.value })}
              className="field-input"
            >
              <option value="">Choose a role</option>
              {PROFESSIONAL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Experience level">
            <div className="grid gap-2 sm:grid-cols-3">
              {SENIORITY_LEVELS.map((level) => (
                <OptionButton
                  key={level}
                  active={value.seniority === level}
                  onClick={() => onChange({ ...value, seniority: level })}
                >
                  {level}
                </OptionButton>
              ))}
            </div>
          </Field>
          <Field label="Goal">
            <div className="grid gap-2">
              {PROFILE_GOALS.map((goal) => (
                <OptionButton
                  key={goal}
                  active={value.goal === goal}
                  onClick={() => onChange({ ...value, goal })}
                >
                  {goal}
                </OptionButton>
              ))}
            </div>
          </Field>
        </div>
      </AnimatedDiv>
      <AnimatedAside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="font-semibold">How this will be used</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your local profile stays available in this browser and is registered
          with the API after GitHub confirms your session.
        </p>
        <div className="mt-5 rounded-lg border border-coral-400/20 bg-coral-400/10 p-4 text-sm text-coral-800 dark:text-coral-100">
          If you are not signed in yet, the last step opens GitHub OAuth and
          returns here to finish registration.
        </div>
      </AnimatedAside>
    </section>
  );
}

function PreferencesStep({
  value,
  onChange,
}: {
  value: MatchPreferences;
  onChange: (value: MatchPreferences) => void;
}) {
  const toggleType = (type: ContributionType) => {
    onChange({
      ...value,
      contributionTypes: value.contributionTypes.includes(type)
        ? value.contributionTypes.filter((item) => item !== type)
        : [...value.contributionTypes, type],
    });
  };

  return (
    <AnimatedSection className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="text-lg font-semibold">Contribution preferences</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <Field label="Contribution types">
          <div className="grid gap-2 sm:grid-cols-2">
            {CONTRIBUTION_TYPES.map((type) => (
              <OptionButton
                key={type}
                active={value.contributionTypes.includes(type)}
                onClick={() => toggleType(type)}
              >
                {type}
              </OptionButton>
            ))}
          </div>
        </Field>
        <div className="grid gap-4">
          <Field label="Difficulty level">
            <select
              value={value.difficulty}
              onChange={(event) =>
                onChange({ ...value, difficulty: event.target.value as DifficultyLevel })
              }
              className="field-input"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project size">
            <select
              value={value.projectSize}
              onChange={(event) =>
                onChange({ ...value, projectSize: event.target.value as ProjectSize })
              }
              className="field-input"
            >
              {PROJECT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Activity level">
            <select
              value={value.activityLevel}
              onChange={(event) =>
                onChange({
                  ...value,
                  activityLevel: event.target.value as ActivityLevel,
                })
              }
              className="field-input"
            >
              {ACTIVITY_LEVELS.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred language">
            <select
              value={value.preferredLanguage}
              onChange={(event) =>
                onChange({ ...value, preferredLanguage: event.target.value })
              }
              className="field-input"
            >
              {preferredLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Organization type">
            <select
              value={value.organizationType}
              onChange={(event) =>
                onChange({
                  ...value,
                  organizationType: event.target.value as OrganizationType,
                })
              }
              className="field-input"
            >
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </AnimatedSection>
  );
}

function MatchingStep({
  detail,
  message,
  status,
  onRetry,
  onSignIn,
}: {
  detail: string;
  message: string;
  status: CompletionStatus;
  onRetry: () => void;
  onSignIn: () => void;
}) {
  const title =
    status === "redirecting"
      ? "Connecting GitHub"
      : status === "done"
        ? "Onboarding registered"
        : status === "error"
          ? "Registration paused"
          : "Building your matches";

  return (
    <AnimatedSection className="flex min-h-[480px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div>
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-coral-400/10 text-coral-500">
          {status === "error" ? (
            <RotateCcw size={30} />
          ) : status === "redirecting" ? (
            <GitBranch size={30} />
          ) : status === "done" ? (
            <Check size={30} />
          ) : (
            <Loader2 className="animate-spin" size={30} />
          )}
        </div>
        <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
        {status === "syncing" || status === "redirecting" || status === "idle" ? (
          <>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              {message}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {LOADING_MESSAGES.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "size-2 rounded-full transition",
                    item === message
                      ? "bg-coral-500"
                      : "bg-zinc-300 dark:bg-white/20",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
        {status === "error" ? (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={onRetry}>
              <RotateCcw size={16} />
              Try again
            </Button>
            <Button type="button" variant="outline" onClick={onSignIn}>
              <GitBranch size={16} />
              Sign in with GitHub
            </Button>
          </div>
        ) : null}
      </div>
    </AnimatedSection>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      {children}
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimateButton
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
        active
          ? "border-coral-400 bg-coral-400/10 text-coral-700 dark:text-coral-200"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-coral-300 hover:bg-coral-400/5 dark:border-white/10 dark:bg-black/20 dark:text-zinc-300",
      )}
    >
      {children}
      {active ? <Check size={16} /> : null}
    </AnimateButton>
  );
}
