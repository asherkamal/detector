"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/lib/cameras";
import type { DatasetClip } from "@/lib/dataset";

type Phase = "evaluating" | "verdict";

export type LiveVerdict = {
  camera: Camera;
  clip: DatasetClip;
  at: number;
};

export function LiveTile({
  camera,
  clip,
  index,
  onVerdict,
  onEnded,
}: {
  camera: Camera;
  clip: DatasetClip;
  index: number;
  onVerdict: (v: LiveVerdict) => void;
  onEnded: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("evaluating");
  const [videoOk, setVideoOk] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onVerdictRef = useRef(onVerdict);
  const onEndedRef = useRef(onEnded);
  onVerdictRef.current = onVerdict;
  onEndedRef.current = onEnded;

  // Restart playback when the parent swaps in a new clip.
  useEffect(() => {
    setPhase("evaluating");
    setVideoOk(false);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [clip.id]);

  // Per-clip lifecycle: evaluate → verdict → ask parent for the next clip.
  useEffect(() => {
    let cancelled = false;
    let verdictTimer: ReturnType<typeof setTimeout> | null = null;
    const evalMs = Math.min(Math.max(clip.durationSec * 1000, 7000), 14000);
    const verdictMs = 3500;

    const evalTimer = setTimeout(() => {
      if (cancelled) return;
      setPhase("verdict");
      onVerdictRef.current({ camera, clip, at: Date.now() });
      verdictTimer = setTimeout(() => {
        if (cancelled) return;
        onEndedRef.current();
      }, verdictMs);
    }, evalMs);

    return () => {
      cancelled = true;
      clearTimeout(evalTimer);
      if (verdictTimer) clearTimeout(verdictTimer);
    };
  }, [clip, camera]);

  const abnormal = clip.prediction === "shoplifting";
  const verdictLabel = abnormal ? "ABNORMAL" : "NORMAL";
  const tone = abnormal
    ? { ring: "ring-red-500/50", text: "text-red-300", bg: "bg-red-500/15", dot: "bg-red-400" }
    : { ring: "ring-emerald-500/50", text: "text-emerald-300", bg: "bg-emerald-500/15", dot: "bg-emerald-400" };

  return (
    <article
      className={`panel scanline relative flex flex-col overflow-hidden ${
        phase === "verdict" && abnormal ? "glow-danger" : ""
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {clip.src ? (
          <>
            <video
              ref={videoRef}
              key={clip.id}
              src={clip.src}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              onLoadedData={() => setVideoOk(true)}
              onError={() => setVideoOk(false)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                videoOk ? "opacity-100" : "opacity-0"
              }`}
            />
            {!videoOk && <FauxFeed seed={index} category={clip.category} />}
          </>
        ) : (
          <FauxFeed seed={index} category={clip.category} />
        )}

        <div className="pointer-events-none absolute left-0 top-0 p-2 text-[11px] font-mono">
          <span className="rounded bg-black/60 px-2 py-1 text-zinc-200 ring-1 ring-white/10">
            {camera.id}
          </span>
        </div>

        {phase === "verdict" && (
          <div className="absolute right-3 top-3">
            <span
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              {verdictLabel}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 text-[11px] font-mono text-zinc-200">
          <span className="truncate text-zinc-500">—</span>
          <Timecode />
        </div>

        {phase === "verdict" && abnormal && (
          <div
            className="pointer-events-none absolute inset-0 animate-[flash_1.2s_ease-out_1]"
            style={{ boxShadow: "inset 0 0 0 4px rgba(255,79,109,0.55)" }}
          />
        )}
      </div>

      <div className="flex items-start border-t border-white/5 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{camera.label}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {camera.zone}
          </p>
        </div>
      </div>
    </article>
  );
}

function Timecode() {
  const [t, setT] = useState("00:00:00");
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setT(
        d.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular">{t}</span>;
}

function FauxFeed({ seed: _seed, category: _category }: { seed: number; category: string }) {
  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-2">
      <span className="font-mono text-xs tracking-widest text-zinc-600 uppercase">No Feed</span>
      <span className="font-mono text-lg font-semibold text-zinc-500">N/A</span>
    </div>
  );
}
