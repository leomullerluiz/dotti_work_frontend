import {
  Award,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { GitHubIcon } from "@/components/ui/Icons";
import type {
  ApiInterestLevel,
  ApiProficiencyLevel,
  ApiPublicUserProfileData,
  ApiRepositoryStateValue,
  ApiSeniority,
} from "@/services/dotti/types";
import { formatNumber } from "@/utils/format";
import { publicProfileHref } from "@/utils/publicProfileRoutes";

const seniorityLabels: Record<ApiSeniority, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
};

const proficiencyLabels: Record<ApiProficiencyLevel, string> = {
  learning: "Learning",
  basic: "Basic",
  daily: "Daily use",
  advanced: "Advanced",
};

const interestLabels: Record<ApiInterestLevel, string> = {
  learn: "Wants to learn",
  contribute: "Wants to contribute",
  mentor: "Can mentor",
};

const repositoryStateLabels: Partial<Record<ApiRepositoryStateValue, string>> = {
  saved: "Saved",
  researching: "Researching",
  working: "In progress",
  pull_request_sent: "Pull request sent",
  contributed: "Contributed",
};

function profileName(data: ApiPublicUserProfileData) {
  return (
    data.profile.display_name?.trim() ||
    data.profile.login?.trim() ||
    data.github.login?.trim() ||
    "dotti.work user"
  );
}

function safeDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function externalUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function metricItems(data: ApiPublicUserProfileData) {
  return [
    {
      label: "Technologies",
      value: data.metrics.technologies_count,
    },
    {
      label: "Badges",
      value: data.metrics.badges_count,
    },
    {
      label: "Saved projects",
      value: data.metrics.repositories_saved_count,
    },
    {
      label: "Contributions",
      value: data.metrics.repositories_contributed_count,
    },
    {
      label: "Pull requests",
      value: data.metrics.pull_requests_sent_count,
    },
    {
      label: "Active days",
      value: data.metrics.activity_days_count,
    },
  ];
}

export function publicProfileDescription(data: ApiPublicUserProfileData) {
  if (data.profile.bio?.trim()) {
    return data.profile.bio.trim();
  }

  const technologies = data.technologies
    .slice(0, 3)
    .map((technology) => technology.name)
    .filter(Boolean);

  if (technologies.length > 0) {
    return `${profileName(data)} is building an open source profile with ${technologies.join(", ")}.`;
  }

  return `${profileName(data)} has a public dotti.work profile.`;
}

export function PublicProfileContent({
  data,
  compact = false,
}: {
  data: ApiPublicUserProfileData;
  compact?: boolean;
}) {
  const name = profileName(data);
  const login = data.profile.login?.trim() || data.github.login?.trim() || "";
  const avatarUrl = data.profile.avatar_url?.trim();
  const websiteUrl = externalUrl(data.profile.website_url);
  const githubUrl = externalUrl(data.profile.github_profile_url) ?? externalUrl(data.github.url);
  const memberSince = safeDate(data.metrics.member_since ?? data.profile.joined_at);
  const lastActivity = safeDate(data.metrics.last_activity_at);
  const visibleRepositories = data.featured_repositories.filter(
    (repository) =>
      repository.state !== "ignored" &&
      repository.state !== "archived" &&
      repository.owner_login &&
      repository.repository_name,
  );

  return (
    <article className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-coral-400/10 text-coral-500 shadow-sm dark:border-white/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${name} avatar`}
                width={96}
                height={96}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <UserRound size={38} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
                  Public profile
                </p>
                <h1
                  className={
                    compact
                      ? "mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white"
                      : "mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl"
                  }
                >
                  {name}
                </h1>
                {login ? (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">@{login}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <GitHubIcon width={16} height={16} />
                    GitHub
                  </a>
                ) : null}
                {websiteUrl ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {data.profile.role ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/[0.06]">
                  <BriefcaseBusiness size={15} />
                  {data.profile.role}
                </span>
              ) : null}
              {data.profile.seniority ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/[0.06]">
                  {seniorityLabels[data.profile.seniority]}
                </span>
              ) : null}
              {data.profile.location ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/[0.06]">
                  <MapPin size={15} />
                  {data.profile.location}
                </span>
              ) : null}
              {data.profile.company ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/[0.06]">
                  <Building2 size={15} />
                  {data.profile.company}
                </span>
              ) : null}
            </div>

            {data.profile.bio ? (
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {data.profile.bio}
              </p>
            ) : null}

            {memberSince || lastActivity ? (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                {memberSince ? <span>Member since {memberSince}</span> : null}
                {lastActivity ? <span>Last activity {lastActivity}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metricItems(data).map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
              {formatNumber(metric.value)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Technologies
        </h2>
        {data.technologies.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.technologies.map((technology) => (
              <span
                key={technology.slug}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-200"
              >
                  {technology.name}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {proficiencyLabels[technology.proficiency_level]} /{" "}
                  {interestLabels[technology.interest_level]}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No technologies have been added yet.
          </p>
        )}
      </section>

      {data.badges.length > 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Badges
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.badges.map((userBadge) => (
              <div
                key={userBadge.slug}
                className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-coral-400/10 text-coral-500">
                  {userBadge.badge.image_url ? (
                    <Image
                      src={userBadge.badge.image_url}
                      alt={userBadge.badge.image_alt || userBadge.badge.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <Award size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-950 dark:text-white">
                    {userBadge.badge.name}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                    {userBadge.badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {visibleRepositories.length > 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Featured repositories
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {visibleRepositories.map((repository) => {
              const label = `${repository.owner_login}/${repository.repository_name}`;
              const repositoryUrl =
                externalUrl(repository.public_url) ??
                `https://github.com/${repository.owner_login}/${repository.repository_name}`;

              return (
                <a
                  key={`${repository.github_repository_id ?? label}-${repository.state}`}
                  href={repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-coral-300 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:border-coral-400/40 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-zinc-950 dark:text-white">
                      {label}
                    </p>
                    <ExternalLink size={16} className="shrink-0 text-zinc-400" />
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {repositoryStateLabels[repository.state] ?? repository.state}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {login ? (
        <p className="text-center text-xs text-zinc-500">
          Public link: {data.share.canonical_url ?? publicProfileHref(login)}
        </p>
      ) : null}
    </article>
  );
}
