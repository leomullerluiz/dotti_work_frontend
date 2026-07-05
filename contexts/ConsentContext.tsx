"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DottiApiError } from "@/services/dotti/client";
import {
  grantConsent,
  listConsents,
  revokeConsent,
} from "@/services/dotti/consents";
import {
  CONSENT_POLICY_VERSION,
  hasGrantedConsent as hasGrantedConsentValue,
} from "@/services/dotti/consentPreferences";
import { syncLocalOptionalConsent } from "@/services/dotti/consentStorage";
import type {
  ApiConsent,
  ApiConsentSource,
  ApiConsentType,
} from "@/services/dotti/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type ConsentContextValue = {
  consents: ApiConsent[];
  isLoading: boolean;
  error: string | null;
  retryConsents: () => Promise<void>;
  grantConsentType: (
    type: ApiConsentType,
    source?: ApiConsentSource,
  ) => Promise<ApiConsent>;
  revokeConsentType: (type: ApiConsentType) => Promise<ApiConsent>;
  hasGrantedConsent: (type: ApiConsentType) => boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function messageForConsentError(error: unknown) {
  if (error instanceof DottiApiError) {
    if (error.status === 401) {
      return "Your session expired. Sign in again to manage privacy consent.";
    }

    if (error.status === 403) {
      return "This session cannot update privacy consent.";
    }

    if (error.status === 404) {
      return "This consent record was not found.";
    }

    if (error.status === 422) {
      return "The consent update was rejected by the API.";
    }

    return error.message;
  }

  return error instanceof Error
    ? error.message
    : "Could not update privacy consent.";
}

function mergeConsent(current: ApiConsent[], next: ApiConsent) {
  const exists = current.some((consent) => consent.type === next.type);

  if (!exists) {
    return [next, ...current];
  }

  return current.map((consent) => (consent.type === next.type ? next : consent));
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const { showToast } = useToast();
  const [consents, setConsents] = useState<ApiConsent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsents = useCallback(async () => {
    if (status !== "authenticated") {
      setConsents([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setConsents(await listConsents());
    } catch (loadError) {
      setConsents([]);
      setError(messageForConsentError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let isCurrent = true;

    if (status !== "authenticated") {
      Promise.resolve().then(() => {
        if (!isCurrent) {
          return;
        }

        setConsents([]);
        setError(null);
        setIsLoading(false);
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

        setIsLoading(true);
        setError(null);
        return listConsents();
      })
      .then((nextConsents) => {
        if (isCurrent && nextConsents) {
          setConsents(nextConsents);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setConsents([]);
          setError(messageForConsentError(loadError));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [status]);

  const grantConsentType = useCallback(
    async (type: ApiConsentType, source: ApiConsentSource = "settings") => {
      try {
        const consent = await grantConsent({
          type,
          policy_version: CONSENT_POLICY_VERSION,
          source,
        });
        setConsents((current) => mergeConsent(current, consent));
        syncLocalOptionalConsent(type, true);
        setError(null);
        return consent;
      } catch (grantError) {
        const message = messageForConsentError(grantError);
        setError(message);
        showToast(message, "error");
        throw grantError;
      }
    },
    [showToast],
  );

  const revokeConsentType = useCallback(
    async (type: ApiConsentType) => {
      try {
        const consent = await revokeConsent(type);
        setConsents((current) => mergeConsent(current, consent));
        syncLocalOptionalConsent(type, false);
        setError(null);
        return consent;
      } catch (revokeError) {
        const message = messageForConsentError(revokeError);
        setError(message);
        showToast(message, "error");
        throw revokeError;
      }
    },
    [showToast],
  );

  const hasGrantedConsent = useCallback(
    (type: ApiConsentType) => hasGrantedConsentValue(consents, type),
    [consents],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consents,
      isLoading,
      error,
      retryConsents: loadConsents,
      grantConsentType,
      revokeConsentType,
      hasGrantedConsent,
    }),
    [
      consents,
      error,
      grantConsentType,
      hasGrantedConsent,
      isLoading,
      loadConsents,
      revokeConsentType,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsents() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsents must be used inside ConsentProvider");
  }

  return context;
}
