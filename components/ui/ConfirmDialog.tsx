"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-950">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
