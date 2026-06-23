"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { makeId } from "@/utils/format";

type ToastTone = "success" | "info" | "error";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const toast = { id: makeId("toast"), message, tone };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => removeToast(toast.id), 3200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 md:bottom-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/30 backdrop-blur dark:border-white/10"
            role="status"
          >
            <span
              className={
                toast.tone === "error"
                  ? "text-red-200"
                  : toast.tone === "info"
                    ? "text-sky-100"
                    : "text-emerald-100"
              }
            >
              {toast.message}
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
