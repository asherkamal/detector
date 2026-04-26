"use client";

import { useEffect, useState } from "react";

type Verdict = "NORMAL" | "ABNORMAL" | "ANALYZING";
type Cell = {
  id: string;
  label: string;
  hue: number;
  verdict: Verdict;
  confidence: number;
};

const SEED: Cell[] = [
  { id: "CAM-A1", label: "Aisle 4 — Cosmetics",   hue: 205, verdict: "ABNORMAL",  confidence: 0.94 },
  { id: "CAM-A2", label: "Self-Checkout B",       hue: 160, verdict: "NORMAL",    confidence: 0.12 },
  { id: "CAM-A3", label: "Electronics — TVs",     hue: 240, verdict: "NORMAL",    confidence: 0.07 },
  { id: "CAM-B1", label: "Apparel — Denim",       hue: 18,  verdict: "ABNORMAL",  confidence: 0.87 },
  { id: "CAM-B2", label: "Pharmacy Counter",      hue: 175, verdict: "NORMAL",    confidence: 0.05 },
  { id: "CAM-B3", label: "Liquor Aisle",          hue: 32,  verdict: "ANALYZING", confidence: 0.55 },
  { id: "CAM-C1", label: "Entrance — North",      hue: 50,  verdict: "ANALYZING", confidence: 0.42 },
  { id: "CAM-C2", label: "Loading Dock",          hue: 195, verdict: "NORMAL",    confidence: 0.11 },
  { id: "CAM-C3", label: "Parking Lot — South",   hue: 220, verdict: "NORMAL",    confidence: 0.06 },
];

const VERDICT_CYCLE: Verdict[] = ["NORMAL", "ANALYZING", "ABNORMAL", "NORMAL"];

export function DetectionWall() {
  const [cells, setCells] = useState<Cell[]>(SEED);

  // Drift verdicts over time so the wall looks alive.
  useEffect(() => {
    const id = setInterval(() => {
      setCells((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        return prev.map((c, idx) => {
          if (idx !== i) return c;
          const cur = VERDICT_CYCLE.indexOf(c.verdict);
          const next = VERDICT_CYCLE[(cur + 1) % VERDICT_CYCLE.length];
          const conf =
            next === "ABNORMAL"
              ? 0.78 + Math.random() * 0.2
              : next === "NORMAL"
              ? Math.random() * 0.18
              : 0.35 + Math.random() * 0.3;
          return { ...c, verdict: next, confidence: Number(conf.toFixed(2)) };
        });
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid h-full w-full grid-cols-3 gap-2 p-2">
      {cells.map((c, i) => (
        <FeedCell key={c.id} cell={c} index={i} />
      ))}
    </div>
  );
}

function FeedCell({ cell, index }: { cell: Cell; index: number }) {
  const tone =
    cell.verdict === "ABNORMAL"
      ? { ring: "ring-red-500/60", text: "text-red-300", bg: "bg-red-500/15", dot: "bg-red-400" }
      : cell.verdict === "ANALYZING"
      ? { ring: "ring-amber-500/60", text: "text-amber-300", bg: "bg-amber-500/15", dot: "bg-amber-400" }
      : { ring: "ring-emerald-500/50", text: "text-emerald-300", bg: "bg-emerald-500/15", dot: "bg-emerald-400" };

  return (
    <div
      className={`relative overflow-hidden rounded-md ring-1 ${tone.ring} ${
        cell.verdict === "ABNORMAL" ? "shadow-[0_0_60px_-10px_rgba(255,79,109,0.55)]" : ""
      }`}
    >
      {/* synthetic feed */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at ${20 + ((index * 13) % 60)}% ${
            30 + ((index * 17) % 50)
          }%, hsla(${cell.hue}, 50%, 22%, 0.95), hsla(${cell.hue}, 30%, 6%, 1) 65%, #000 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* scanning beam for analyzing cells */}
      {cell.verdict === "ANALYZING" && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 -top-1/3 h-1/3 animate-[scan_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-amber-300/30 to-transparent" />
        </div>
      )}

      {/* corner brackets */}
      <Brackets active={cell.verdict === "ABNORMAL"} />

      {/* labels */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 text-[10px] font-mono">
        <span className="rounded bg-black/60 px-1.5 py-0.5 text-zinc-200 ring-1 ring-white/10">
          {cell.id}
        </span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 text-red-300 ring-1 ring-red-500/30">
          ● REC
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            <span className={`h-1 w-1 rounded-full dot-pulse ${tone.dot}`} />
            {cell.verdict}
          </span>
          <span className="font-mono text-[10px] tabular text-white">
            {(cell.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-[width] duration-700 ${
              cell.verdict === "ABNORMAL"
                ? "bg-red-400"
                : cell.verdict === "ANALYZING"
                ? "bg-amber-300"
                : "bg-emerald-400"
            }`}
            style={{ width: `${cell.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Brackets({ active }: { active: boolean }) {
  const cls = active ? "border-red-400" : "border-white/30";
  return (
    <>
      <span className={`absolute left-2 top-8 h-3 w-3 border-l border-t ${cls}`} />
      <span className={`absolute right-2 top-8 h-3 w-3 border-r border-t ${cls}`} />
      <span className={`absolute left-2 bottom-10 h-3 w-3 border-l border-b ${cls}`} />
      <span className={`absolute right-2 bottom-10 h-3 w-3 border-r border-b ${cls}`} />
    </>
  );
}
