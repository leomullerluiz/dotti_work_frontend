/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Sparkles,
  Star,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { mockProjects } from "@/data/repositories";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

const technologies = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "PHP",
  "Laravel",
  "Python",
  "Java",
  "Vue",
  "Angular",
  "WordPress",
  "Docker",
  "GitHub Actions",
  "TailwindCSS",
];

const benefits = [
  "Personalized recommendations",
  "Open issues ready to contribute",
  "Repository health score",
  "Beginner-friendly projects",
  "Save and track your contributions",
];

const steps = [
  ["Tell us your stack", "Choose languages, frameworks, libraries, and tools."],
  ["Choose your experience level", "Tune recommendations for Junior, Mid-Level, or Senior work."],
  ["Discover matching projects", "See repositories ranked by compatibility and health."],
  ["Start contributing", "Save, research, and track your local contribution flow."],
];

export function LandingPage() {
  const featured = mockProjects.slice(0, 3);

  return (
    <main className="min-h-screen bg-app text-zinc-950 dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <StaticLogo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
          <a href="#how-it-works" className="hover:text-coral-600 dark:hover:text-white">
            How it works
          </a>
          <a href="#technologies" className="hover:text-coral-600 dark:hover:text-white">
            Technologies
          </a>
          <a href="#benefits" className="hover:text-coral-600 dark:hover:text-white">
            Benefits
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/login">
            Login
          </a>
          <a
            href="/onboarding"
            className={buttonClasses({ size: "sm", className: "hidden sm:inline-flex" })}
          >
            Start
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div>
          <StaticBadge tone="accent">Open source matching for developers</StaticBadge>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-6xl">
            Find open source projects that match your skills.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            dotti.work recommends open source repositories based on your stack,
            seniority, contribution goals, project health, and beginner-friendly
            signals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/onboarding" className={buttonClasses({ size: "lg" })}>
              Find projects for me
              <ArrowRight size={17} />
            </a>
            <a
              href="#how-it-works"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              How it works
            </a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["12", "mock repositories"],
              ["8", "contribution types"],
              ["100%", "local data"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="text-2xl font-semibold text-coral-500">{value}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-500">
                  Live preview
                </p>
                <h2 className="mt-1 font-semibold">Recommended matches</h2>
              </div>
              <Sparkles size={20} className="text-coral-500" />
            </div>
            <div className="mt-4 space-y-3">
              {featured.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{project.owner}/{project.repo}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {project.description}
                      </p>
                    </div>
                    <StaticBadge tone="success">{project.matchScore}%</StaticBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.languages.slice(0, 3).map((language) => (
                      <StaticBadge key={language} tone="blue">
                        {language}
                      </StaticBadge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {formatNumber(project.stars)}
                    </span>
                    <span>{project.goodFirstIssues} good first issues</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-zinc-200 bg-white/60 py-16 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How it works"
            description="A short path from profile setup to actionable contribution targets."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map(([title, description], index) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-coral-400/10 text-sm font-semibold text-coral-500">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technologies" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Supported technologies"
          description="The mock catalog is ready for future GitHub topic and language matching."
        />
        <div className="mt-8 flex flex-wrap gap-2">
          {technologies.map((technology) => (
            <StaticBadge key={technology} tone="neutral" className="px-3 py-1.5">
              {technology}
            </StaticBadge>
          ))}
        </div>
      </section>

      <section
        id="benefits"
        className="border-y border-zinc-200 bg-white/60 py-16 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.8fr_1fr] lg:px-8">
          <SectionHeading
            title="Designed for contributor momentum"
            description="dotti.work focuses on practical signals: issue labels, health checklist, match reasons, and contribution status."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60"
              >
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-8 text-white shadow-2xl shadow-zinc-900/15 dark:border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Ready to find your next open source contribution?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Complete the onboarding and get a ranked list of projects using local
                mock data today, ready for API-backed matching later.
              </p>
            </div>
            <a href="/onboarding" className={buttonClasses({ size: "lg" })}>
              Start onboarding
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <StaticLogo />
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-coral-600">
              <GitBranch size={15} />
              GitHub
            </a>
            <a href="#" className="hover:text-coral-600">
              Privacy
            </a>
            <a href="#" className="hover:text-coral-600">
              Terms
            </a>
            <span className="flex items-center gap-1">
              <GitBranch size={15} />
              Made for open source contributors
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StaticLogo() {
  return (
    <a href="/" className="flex items-center gap-2" aria-label="dotti.work home">
      <img
        src="/dotti-icon.svg"
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full shadow-lg shadow-coral-500/20"
      />
      <span className="flex h-6 items-center">
        <img
          src="/dotti-wordmark.svg"
          alt="dotti.work"
          width={94}
          height={24}
          className="h-6 w-auto dark:hidden"
        />
        <span className="hidden text-base font-semibold tracking-tight text-white dark:inline">
          dotti<span className="text-coral-500">.</span>work
        </span>
      </span>
    </a>
  );
}

const badgeTones = {
  neutral:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300",
  accent:
    "border-coral-400/30 bg-coral-400/10 text-coral-700 dark:text-coral-200",
  success:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
  blue: "border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-200",
};

function StaticBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
        dotti.work
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
