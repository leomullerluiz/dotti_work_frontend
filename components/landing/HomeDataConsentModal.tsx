"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
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

type StoredConsent = {
  decision: ConsentDecision;
  source: "home";
  version: string;
  decidedAt: string;
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
  const consentSnapshot = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const open = consentSnapshot === "missing";

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
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-coral-400/10 text-coral-500">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-zinc-950 dark:text-white">
                Consentimento de dados
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                O dotti.work usa armazenamento local e, no fluxo autenticado,
                dados da sua conta GitHub para criar sessão, salvar preferências,
                montar seu perfil técnico e recomendar projetos open source.
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
            <div className="flex items-start gap-3">
              <Database size={18} className="mt-0.5 shrink-0 text-coral-500" />
              <p>
                Você pode aceitar esse uso de dados agora ou continuar sem
                consentir com coletas opcionais. Cookies/sessão necessários
                podem continuar sendo usados para segurança e funcionamento.
              </p>
            </div>
            <p className="mt-3">
              Leia os{" "}
              <Link
                href="/terms"
                className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/privacy"
                className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
              >
                Política de Privacidade
              </Link>{" "}
              antes de continuar.
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveDecision("declined")}
            >
              Recusar opcionais
            </Button>
            <Button type="button" onClick={() => saveDecision("accepted")}>
              Aceitar e continuar
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
