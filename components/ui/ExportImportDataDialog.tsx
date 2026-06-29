"use client";

import { useState } from "react";
import { Download, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/animate-ui/primitives/radix/dialog";
import { Button } from "./Button";

export function ExportImportDataDialog({
  open,
  title,
  exportLabel,
  importLabel,
  exportValue,
  onImport,
  onClose,
}: {
  open: boolean;
  title: string;
  exportLabel: string;
  importLabel: string;
  exportValue: unknown;
  onImport: (json: string) => boolean;
  onClose: () => void;
}) {
  const [json, setJson] = useState("");

  const serialized = JSON.stringify(exportValue, null, 2);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm" />
        <DialogContent
          from="top"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 outline-none"
        >
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/10">
              <DialogTitle className="font-semibold text-zinc-950 dark:text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Export and import local JSON data.
              </DialogDescription>
              <DialogClose
                className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X size={16} />
              </DialogClose>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-950 dark:text-white">
                  <Download size={16} />
                  {exportLabel}
                </div>
                <textarea
                  readOnly
                  value={serialized}
                  className="h-72 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700 outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-950 dark:text-white">
                  <Upload size={16} />
                  {importLabel}
                </div>
                <textarea
                  value={json}
                  onChange={(event) => setJson(event.target.value)}
                  placeholder="Paste JSON here"
                  className="h-72 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-700 outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-200 px-5 py-4 dark:border-white/10">
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (onImport(json)) {
                    setJson("");
                    onClose();
                  }
                }}
                disabled={!json.trim()}
              >
                Import JSON
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
