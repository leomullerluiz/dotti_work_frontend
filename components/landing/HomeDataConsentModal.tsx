"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Database, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/animate-ui/primitives/radix/dialog";
import { Button } from "@/components/ui/Button";
import { STORAGE_KEYS } from "@/data/constants";

const consentVersion = "2026-07-03";
const consentStoreEventName = "dotti-consent-change";

type ConsentDecision = "accepted" | "declined";
type ConsentLanguage = "en" | "pt";

type StoredConsent = {
  decision: ConsentDecision;
  source: "home";
  version: string;
  decidedAt: string;
};

const consentCopy: Record<
  ConsentLanguage,
  {
    accept: string;
    body: string;
    decline: string;
    legalConnector: string;
    legalPrefix: string;
    legalSuffix: string;
    privacy: string;
    terms: string;
    title: string;
    usage: string;
  }
> = {
  en: {
    accept: "Accept and continue",
    body:
      "dotti.work uses local storage and, in the authenticated flow, data from your GitHub account to create a session, save preferences, build your technical profile, and recommend open source projects.",
    decline: "Decline optional",
    legalConnector: "and the",
    legalPrefix: "Read the",
    legalSuffix: "before continuing.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    title: "Data consent",
    usage:
      "You can accept this data use now or continue without consenting to optional collection. Necessary cookies/session data may still be used for security and functionality.",
  },
  pt: {
    accept: "Aceitar e continuar",
    body:
      "O dotti.work usa armazenamento local e, no fluxo autenticado, dados da sua conta GitHub para criar sessao, salvar preferencias, montar seu perfil tecnico e recomendar projetos open source.",
    decline: "Recusar opcionais",
    legalConnector: "e a",
    legalPrefix: "Leia os",
    legalSuffix: "antes de continuar.",
    privacy: "Politica de Privacidade",
    terms: "Termos de Uso",
    title: "Consentimento de dados",
    usage:
      "Voce pode aceitar esse uso de dados agora ou continuar sem consentir com coletas opcionais. Cookies/sessao necessarios podem continuar sendo usados para seguranca e funcionamento.",
  },
};

function readStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.consent);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as Partial<StoredConsent>;

    return parsed.version === consentVersion &&
      (parsed.decision === "accepted" || parsed.decision === "declined")
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getConsentSnapshot() {
  if (typeof window === "undefined") {
    return "server";
  }

  return readStoredConsent() ? "stored" : "missing";
}

function getServerConsentSnapshot() {
  return "server";
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(consentStoreEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(consentStoreEventName, onStoreChange);
  };
}

export function HomeDataConsentModal() {
  const [language, setLanguage] = useState<ConsentLanguage>("en");
  const consentSnapshot = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const open = consentSnapshot === "missing";
  const copy = consentCopy[language];

  function saveDecision(decision: ConsentDecision) {
    const consent: StoredConsent = {
      decision,
      source: "home",
      version: consentVersion,
      decidedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(consent));
    window.dispatchEvent(new Event(consentStoreEventName));
  }

  return (
    <Dialog open={open} modal={false}>
      <DialogPortal>
        <DialogContent
          className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-900/15 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30 sm:bottom-6"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex items-start gap-4" lang={language === "en" ? "en-US" : "pt-BR"}>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <DialogTitle className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {copy.title}
                </DialogTitle>
                <div
                  aria-label="Language selector"
                  className="inline-flex w-fit items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <input
                    id="home-consent-language-en"
                    name="home-consent-language"
                    type="radio"
                    className="sr-only"
                    checked={language === "en"}
                    onChange={() => setLanguage("en")}
                  />
                  <input
                    id="home-consent-language-pt"
                    name="home-consent-language"
                    type="radio"
                    className="sr-only"
                    checked={language === "pt"}
                    onChange={() => setLanguage("pt")}
                  />
                  <label
                    htmlFor="home-consent-language-en"
                    className={`flex h-8 min-w-10 cursor-pointer items-center justify-center rounded-md px-2 text-xs font-semibold transition-[background-color,transform,box-shadow] hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:hover:bg-white/10 ${
                      language === "en"
                        ? "bg-coral-400/10 text-coral-700 shadow-sm dark:text-coral-200"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                    aria-label="English"
                  >
                    EN
                  </label>
                  <label
                    htmlFor="home-consent-language-pt"
                    className={`flex h-8 min-w-10 cursor-pointer items-center justify-center rounded-md px-2 text-xs font-semibold transition-[background-color,transform,box-shadow] hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:hover:bg-white/10 ${
                      language === "pt"
                        ? "bg-coral-400/10 text-coral-700 shadow-sm dark:text-coral-200"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                    aria-label="Portugues"
                  >
                    PT
                  </label>
                </div>
              </div>
              <DialogDescription className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {copy.body}
              </DialogDescription>
            </div>
          </div>

          <div
            className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400"
            lang={language === "en" ? "en-US" : "pt-BR"}
          >
            <div className="flex items-start gap-3">
              <Database size={18} className="mt-0.5 shrink-0 text-coral-500" />
              <p>{copy.usage}</p>
            </div>
            <p className="mt-3">
              {copy.legalPrefix}{" "}
              <Link
                href="/terms"
                className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
              >
                {copy.terms}
              </Link>{" "}
              {copy.legalConnector}{" "}
              <Link
                href="/privacy"
                className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
              >
                {copy.privacy}
              </Link>{" "}
              {copy.legalSuffix}
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveDecision("declined")}
            >
              {copy.decline}
            </Button>
            <Button type="button" onClick={() => saveDecision("accepted")}>
              {copy.accept}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
