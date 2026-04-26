"use client";

import { useEffect, useState } from "react";
import type { Camera } from "@/lib/cameras";
import type { DatasetClip } from "@/lib/dataset";

export type LiveAlert = {
  uid: string;
  camera: Camera;
  clip: DatasetClip;
  at: number;
};

type ActionState =
  | { kind: "idle" }
  | { kind: "calling" }
  | { kind: "dispatched"; label: string };

const AUTO_DISMISS_MS = 14000;

export function AlertBannerStack({
  alerts,
  onDismiss,
  onAction,
}: {
  alerts: LiveAlert[];
  onDismiss: (uid: string) => void;
  onAction: (label: string, alert: LiveAlert) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 w-full max-w-full">
      {alerts.slice(0, 1).map((a) => (
        <AlertBanner
          key={a.uid}
          alert={a}
          onDismiss={() => onDismiss(a.uid)}
          onAction={(label: string) => onAction(label, a)}
        />
      ))}
    </div>
  );
}

function AlertBanner({
  alert,
  onDismiss,
  onAction,
}: {
  alert: LiveAlert;
  onDismiss: () => void;
  onAction: (label: string) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState<ActionState>({ kind: "idle" });

  // Auto-dismiss after a delay
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 100;
        if (next >= AUTO_DISMISS_MS) {
          setTimeout(onDismiss, 0);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [onDismiss]);

  const triggerAction = (label: string) => {
    if (label === "Call 911") {
      setState({ kind: "calling" });
      setTimeout(() => {
        setState({ kind: "dispatched", label });
        onAction(label);
        setTimeout(onDismiss, 1800);
      }, 1500);
      return;
    }
    setState({ kind: "dispatched", label });
    onAction(label);
    setTimeout(onDismiss, 1500);
  };

  return (
    <div className="pointer-events-auto animate-fade-in-up overflow-hidden rounded-xl border border-emerald-700/30 bg-black/80 px-6 py-3 shadow-lg backdrop-blur flex items-center gap-3 min-w-[220px] max-w-[90vw]">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700/30 text-emerald-300">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-emerald-200">Alerted manager for review</span>
      <button
        onClick={onDismiss}
        className="ml-auto rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "red" | "amber" | "muted";
}) {
  const map: Record<string, string> = {
    red: "bg-red-500/15 text-red-200 ring-red-500/40 hover:bg-red-500/25",
    amber: "bg-amber-500/15 text-amber-200 ring-amber-500/40 hover:bg-amber-500/25",
    muted: "bg-white/[0.03] text-zinc-300 ring-white/10 hover:bg-white/[0.07]",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1.5 text-[11px] font-medium ring-1 transition ${map[tone]}`}
    >
      {children}
    </button>
  );
}
