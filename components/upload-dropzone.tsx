"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  finalizeUploadAction,
  uploadVideoAction,
} from "@/app/actions/uploads";
import type { Upload } from "@/lib/uploads";

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number; name: string }
  | { kind: "analyzing"; upload: Upload; progress: number }
  | { kind: "done"; upload: Upload }
  | { kind: "error"; message: string };

export function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [, startTransition] = useTransition();

  // Animate the analyzing progress bar.
  useEffect(() => {
    if (phase.kind !== "analyzing") return;
    const id = setInterval(() => {
      setPhase((p) => {
        if (p.kind !== "analyzing") return p;
        const next = Math.min(100, p.progress + 4 + Math.random() * 6);
        return { ...p, progress: next };
      });
    }, 120);
    return () => clearInterval(id);
  }, [phase.kind]);

  const handleFile = async (file: File) => {
    setPhase({ kind: "uploading", progress: 0, name: file.name });

    // Upload progress via XHR (server actions don't expose progress).
    const fd = new FormData();
    fd.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setPhase({ kind: "uploading", progress: (e.loaded / e.total) * 100, name: file.name });
      }
    };
    xhr.onerror = () => setPhase({ kind: "error", message: "Network error during upload." });
    xhr.onload = async () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        setPhase({ kind: "error", message: `Upload failed (${xhr.status}).` });
        return;
      }
      try {
        const res = JSON.parse(xhr.responseText) as
          | { ok: true; upload: Upload }
          | { ok: false; error: string };
        if (!res.ok) {
          setPhase({ kind: "error", message: res.error });
          return;
        }
        setPhase({ kind: "analyzing", upload: res.upload, progress: 0 });
        // Simulate inference taking ~2.5s, then finalize.
        setTimeout(async () => {
          const finalized = await finalizeUploadAction(res.upload.id);
          if (finalized) {
            setPhase({ kind: "done", upload: finalized });
            startTransition(() => router.refresh());
          }
        }, 2600);
      } catch {
        setPhase({ kind: "error", message: "Could not parse server response." });
      }
    };
    xhr.send(fd);
  };

  // Fallback: server action variant if no JS-progress is needed.
  const submitForm = async (file: File) => {
    setPhase({ kind: "uploading", progress: 30, name: file.name });
    const fd = new FormData();
    fd.append("video", file);
    const res = await uploadVideoAction(fd);
    if (!res.ok) {
      setPhase({ kind: "error", message: res.error });
      return;
    }
    setPhase({ kind: "analyzing", upload: res.upload, progress: 0 });
    setTimeout(async () => {
      const finalized = await finalizeUploadAction(res.upload.id);
      if (finalized) {
        setPhase({ kind: "done", upload: finalized });
        startTransition(() => router.refresh());
      }
    }, 2600);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file).catch(() => submitForm(file));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file).catch(() => submitForm(file));
  };

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5"
            : "border-white/10 bg-black/30 hover:border-white/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          onChange={onPick}
          className="hidden"
        />
        <span className="absolute inset-0 -z-10 rounded-2xl bg-grid opacity-20" aria-hidden />
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-[color:var(--accent)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-white">
            Drop a clip to classify, or <span className="text-[color:var(--accent)]">browse</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            mp4 · mov · webm · mkv · up to 200 MB
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 dot-pulse" />
          on-device · videomae-base · ckpt v3.2
        </div>
      </label>

      <PhasePanel phase={phase} onReset={() => setPhase({ kind: "idle" })} />
    </div>
  );
}

function PhasePanel({ phase, onReset }: { phase: Phase; onReset: () => void }) {
  if (phase.kind === "idle") return null;

  if (phase.kind === "uploading") {
    return (
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-300">Uploading <span className="font-mono text-zinc-400">{phase.name}</span></span>
          <span className="font-mono tabular text-zinc-400">{phase.progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[color:var(--accent)] transition-[width] duration-200" style={{ width: `${phase.progress}%` }} />
        </div>
      </div>
    );
  }

  if (phase.kind === "analyzing") {
    return (
      <div className="panel relative overflow-hidden p-4">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent" />
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 dot-pulse" />
            Running VideoMAE inference…
          </span>
          <span className="font-mono tabular text-zinc-400">{phase.progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-amber-400 transition-[width] duration-200" style={{ width: `${phase.progress}%` }} />
        </div>
        <p className="mt-3 font-mono text-[11px] text-zinc-500">
          ▌ sampling 16 frames · embedding · classifying · {phase.upload.id}
        </p>
      </div>
    );
  }

  if (phase.kind === "done") {
    const u = phase.upload;
    const abnormal = u.status === "abnormal";
    return (
      <div className={`panel-strong relative overflow-hidden p-4 ${abnormal ? "glow-danger" : ""}`}>
        <div className="flex items-start gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${
              abnormal
                ? "bg-red-500/15 text-red-300 ring-red-500/30"
                : "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
            }`}
          >
            {abnormal ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ring-1 ${
                  abnormal
                    ? "bg-red-500/15 text-red-300 ring-red-500/30"
                    : "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                }`}
              >
                {abnormal ? "ABNORMAL" : "NORMAL"}
              </span>
              <span className="font-mono text-[11px] text-zinc-500">{u.id}</span>
            </div>
            <p className="mt-2 text-sm text-white">{u.classification}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{u.notes}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-400 tabular">
                confidence {(u.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-zinc-700">·</span>
              <span className="font-mono text-xs text-zinc-400">{u.originalName}</span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
      <div className="flex items-center justify-between">
        <span>{phase.message}</span>
        <button
          onClick={onReset}
          className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-200 transition hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
