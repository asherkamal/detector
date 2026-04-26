"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUploadAction } from "@/app/actions/uploads";
import type { Upload } from "@/lib/uploads";

export function UploadCard({ upload }: { upload: Upload }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const tone =
    upload.status === "abnormal"
      ? { label: "ABNORMAL", text: "text-red-300", bg: "bg-red-500/15", ring: "ring-red-500/40", dot: "bg-red-400" }
      : upload.status === "analyzing"
      ? { label: "ANALYZING", text: "text-amber-300", bg: "bg-amber-500/15", ring: "ring-amber-500/40", dot: "bg-amber-400" }
      : { label: "NORMAL", text: "text-emerald-300", bg: "bg-emerald-500/15", ring: "ring-emerald-500/40", dot: "bg-emerald-400" };

  const sizeMb = (upload.sizeBytes / (1024 * 1024)).toFixed(1);
  const ts = new Date(upload.uploadedAt).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <article className={`panel scanline relative flex flex-col overflow-hidden ${
      upload.status === "abnormal" ? "glow-danger" : ""
    }`}>
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          src={upload.publicUrl}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 text-[10px] font-mono">
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-zinc-200 ring-1 ring-white/10">
            {upload.id}
          </span>
          <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-bold tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
            <span className={`h-1 w-1 rounded-full dot-pulse ${tone.dot}`} />
            {tone.label}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-200">
            <span>{sizeMb} MB · {upload.durationSec}s</span>
            <span className="tabular">{ts}</span>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-300">
              <span>confidence</span>
              <span className="font-mono tabular text-white">{(upload.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`absolute inset-y-0 left-0 transition-[width] duration-700 ${
                  upload.status === "abnormal" ? "bg-red-400" : upload.status === "analyzing" ? "bg-amber-300" : "bg-emerald-400"
                }`}
                style={{ width: `${upload.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
        {upload.status === "analyzing" && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 -top-1/3 h-1/3 animate-[scan_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-amber-300/30 to-transparent" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-white/5 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{upload.classification}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{upload.originalName}</p>
          <p className="mt-1 truncate text-[11px] text-zinc-600">{upload.notes}</p>
        </div>
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              await deleteUploadAction(upload.id);
              router.refresh();
            })
          }
          aria-label={`Delete ${upload.id}`}
          className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] p-1.5 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}
