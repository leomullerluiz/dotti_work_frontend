"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
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
} from "@/data/constants";
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

export function MultiStepOnboarding() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const savedOnce = useRef(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
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

  useEffect(() => {
    if (step !== 3 || savedOnce.current) {
      return;
    }

    savedOnce.current = true;
    const nextProfile: DeveloperProfile = {
      name: profileState.name.trim() || undefined,
      role: profileState.role,
      seniority: profileState.seniority as SeniorityLevel,
      goal: profileState.goal,
      technologies,
      preferences,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    saveProfile(nextProfile);

    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        current + 1 >= LOADING_MESSAGES.length ? current : current + 1,
      );
    }, 850);

    const timeout = window.setTimeout(() => {
      router.push("/matches");
    }, 3600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [preferences, profileState, router, saveProfile, step, technologies]);

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
    setStep((current) => Math.max(current - 1, 0));
  };

  return (
    <div className="min-h-screen bg-app px-4 py-6 text-zinc-950 dark:text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
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
        </header>

        {error ? (
          <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
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
        {step === 3 ? <MatchingStep message={LOADING_MESSAGES[messageIndex]} /> : null}

        {step < 3 ? (
          <footer className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={step === 0}
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
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
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
      </div>
      <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="font-semibold">How this will be used</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The prototype stores this profile only in your browser and uses it to tune
          mock recommendations, filters, saved projects, and local contribution stats.
        </p>
        <div className="mt-5 rounded-lg border border-coral-400/20 bg-coral-400/10 p-4 text-sm text-coral-800 dark:text-coral-100">
          Future GitHub OAuth can reuse this shape to sync preferences with a real API.
        </div>
      </aside>
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
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
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
    </section>
  );
}

function MatchingStep({ message }: { message: string }) {
  return (
    <section className="flex min-h-[480px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div>
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-coral-400/10 text-coral-500">
          <Loader2 className="animate-spin" size={30} />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Building your matches</h2>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          {LOADING_MESSAGES.map((item) => (
            <span
              key={item}
              className={cn(
                "size-2 rounded-full transition",
                item === message ? "bg-coral-500" : "bg-zinc-300 dark:bg-white/20",
              )}
            />
          ))}
        </div>
      </div>
    </section>
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
    <button
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
    </button>
  );
}
