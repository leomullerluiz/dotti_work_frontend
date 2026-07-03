import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export function LegalDocument({
  children,
  en,
  pt,
}: {
  children: ReactNode;
  en: {
    description: string;
    title: string;
    updatedAt: string;
  };
  pt: {
    description: string;
    title: string;
    updatedAt: string;
  };
}) {
  return (
    <main className="legal-document min-h-screen bg-app text-zinc-950 dark:text-white">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/privacy" className="hover:text-coral-600 dark:hover:text-white">
              <span className="legal-pt">Privacidade</span>
              <span className="legal-en">Privacy</span>
            </Link>
            <Link href="/terms" className="hover:text-coral-600 dark:hover:text-white">
              <span className="legal-pt">Termos</span>
              <span className="legal-en">Terms</span>
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-coral-600 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          <span className="legal-pt">Voltar para a home</span>
          <span className="legal-en">Back to home</span>
        </Link>

        <div className="mt-8 border-b border-zinc-200 pb-8 dark:border-white/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-500">
                dotti.work
              </p>
              <h1 className="legal-pt mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {pt.title}
              </h1>
              <h1 className="legal-en mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {en.title}
              </h1>
              <p className="legal-pt mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {pt.description}
              </p>
              <p className="legal-en mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {en.description}
              </p>
              <p className="legal-pt mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                Ultima atualizacao: {pt.updatedAt}
              </p>
              <p className="legal-en mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                Last updated: {en.updatedAt}
              </p>
            </div>
            <div
              aria-label="Language selector"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <input
                id="legal-language-en"
                name="legal-language"
                type="radio"
                className="sr-only"
                defaultChecked
              />
              <input
                id="legal-language-pt"
                name="legal-language"
                type="radio"
                className="sr-only"
              />
              <label
                htmlFor="legal-language-en"
                className="legal-language-en-option flex size-9 cursor-pointer items-center justify-center rounded-md text-lg leading-none transition-[background-color,transform,box-shadow] hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:hover:bg-white/10"
                aria-label="English"
              >
                <span aria-hidden="true">🇺🇸</span>
              </label>
              <label
                htmlFor="legal-language-pt"
                className="legal-language-pt-option flex size-9 cursor-pointer items-center justify-center rounded-md text-lg leading-none transition-[background-color,transform,box-shadow] hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:hover:bg-white/10"
                aria-label="Portugues"
              >
                <span aria-hidden="true">🇧🇷</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </article>
    </main>
  );
}

export function LegalSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-b border-zinc-200 pb-8 last:border-b-0 dark:border-white/10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
    >
      {children}
    </a>
  );
}
