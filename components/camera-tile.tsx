"use client";

import { useEffect, useRef, useState } from "react";
import { type Camera, statusTone } from "@/lib/cameras";

export function CameraTile({ camera, index }: { camera: Camera; index: number }) {
  const tone = statusTone(camera.status);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [score, setScore] = useState(camera.threat);

  // Simulated streaming inference: gentle drift around the camera's baseline threat.
  useEffect(() => {
    const id = setInterval(() => {
      setScore((s) => {
        const noise = (Math.random() - 0.5) * 0.06;
        const next = Math.min(0.99, Math.max(0.01, camera.threat + noise + (s - camera.threat) * 0.4));
        return Number(next.toFixed(2));
      });
    }, 1100 + (index % 5) * 130);
    return () => clearInterval(id);
  }, [camera.threat, index]);

  return (
    <article
      className={`panel scanline relative flex flex-col overflow-hidden ${
        camera.status === "alert" ? "glow-danger" : ""
      }`}
    >
      {/* Video / placeholder area */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {camera.videoSrc && (
          <video
            ref={videoRef}
            src={camera.videoSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {!videoReady && <FauxFeed seed={index} />}

        {/* Top overlay: ID + REC */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 text-[11px] tracking-wider">
          <span className="rounded-md bg-black/60 px-2 py-1 font-mono text-zinc-200 ring-1 ring-white/10">
            {camera.id}
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 font-mono text-red-300 ring-1 ring-red-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 dot-pulse" />
            REC
          </span>
        </div>

        {/* Bottom overlay: timecode + threat bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-200">
            <span>{camera.fps} fps · {camera.resolution}</span>
            <Timecode />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-300">
              <span>threat</span>
              <span className="font-mono tabular text-white">{(score * 100).toFixed(0)}%</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`absolute inset-y-0 left-0 transition-[width] duration-700 ease-out ${
                  score > 0.8
                    ? "bg-[color:var(--danger)]"
                    : score > 0.4
                    ? "bg-[color:var(--warn)]"
                    : "bg-[color:var(--accent)]"
                }`}
                style={{ width: `${score * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status chip */}
        <div className="absolute right-3 top-12">
          <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
            <span className={`h-1.5 w-1.5 rounded-full dot-pulse ${tone.dot}`} />
            {tone.label}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-start justify-between gap-3 border-t border-white/5 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{camera.label}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{camera.zone} · {camera.lastEvent}</p>
        </div>
        <button
          className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          aria-label={`Inspect ${camera.id}`}
        >
          Inspect
        </button>
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

// Looks like a noisy CCTV feed when no video is available.
function FauxFeed({ seed }: { seed: number }) {
  const hue = 160 + ((seed * 37) % 80);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(120% 80% at ${20 + ((seed * 13) % 60)}% ${
            30 + ((seed * 17) % 50)
          }%, hsla(${hue}, 50%, 22%, 0.9), hsla(${hue}, 30%, 8%, 0.95) 60%, #000 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-md bg-black/50 px-3 py-1.5 font-mono text-[11px] tracking-widest text-zinc-300 ring-1 ring-white/10">
          NO SIGNAL · SIM
        </span>
      </div>
    </div>
  );
}
