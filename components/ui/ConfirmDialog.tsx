"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/animate-ui/primitives/radix/alert-dialog";
import { buttonClasses } from "./Button";

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
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <AlertDialogPortal>
        <AlertDialogOverlay className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm" />
        <AlertDialogContent
          from="top"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 outline-none"
        >
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <AlertDialogHeader className="flex gap-3 text-left">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {title}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {description}
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex justify-end gap-3">
              <AlertDialogCancel className={buttonClasses({ variant: "ghost" })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className={buttonClasses({ variant: "danger" })}
              >
                {confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
