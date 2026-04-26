"use client";

import { useEffect } from "react";

export type Toast = {
  uid: string;
  label: string;
  body: string;
  tone: "red" | "emerald" | "sky";
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (uid: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-[420px] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.uid} toast={t} onDismiss={() => onDismiss(t.uid)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const map: Record<string, string> = {
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  };

  return (
    <div
      className={`pointer-events-auto slide-up flex items-start gap-3 rounded-xl border bg-zinc-950/80 px-4 py-3 backdrop-blur ${map[toast.tone]}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{toast.label}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{toast.body}</p>
      </div>
      <button
        onClick={onDismiss}
        className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
