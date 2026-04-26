"use client";

import { useEffect, useState } from "react";

const SEED = [
  { t: "21:42:11", cam: "CAM-01", msg: "Concealment detected · Aisle 4 — Cosmetics", tone: "danger" },
  { t: "21:39:02", cam: "CAM-06", msg: "Tag tampering · Apparel — Denim", tone: "danger" },
  { t: "21:36:48", cam: "CAM-08", msg: "Loitering > 90s · Liquor Aisle", tone: "warn" },
  { t: "21:33:17", cam: "CAM-05", msg: "Group entry · Entrance — North", tone: "warn" },
  { t: "21:29:55", cam: "CAM-02", msg: "Skip-scan resolved · Self-Checkout B", tone: "muted" },
  { t: "21:25:04", cam: "CAM-03", msg: "Box tampering recovered · Electronics — TVs", tone: "danger" },
  { t: "21:21:30", cam: "CAM-07", msg: "Vendor verified · Loading Dock", tone: "muted" },
  { t: "21:18:12", cam: "CAM-04", msg: "Customer assisted · Pharmacy", tone: "muted" },
] as const;

const toneClass: Record<string, string> = {
  danger: "text-[color:var(--danger)]",
  warn: "text-[color:var(--warn)]",
  muted: "text-zinc-400",
};

export function EventTicker() {
  const [items] = useState(SEED);

  useEffect(() => {}, []);

  const doubled = [...items, ...items];

  return (
    <div className="panel relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
        live event stream
        <span className="ml-auto font-mono text-zinc-600">/ inference daemon</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="ticker-track flex whitespace-nowrap py-3">
          {doubled.map((it, i) => (
            <div key={i} className="mx-6 flex items-center gap-3 text-sm">
              <span className="font-mono tabular text-zinc-500">{it.t}</span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300 ring-1 ring-white/10">
                {it.cam}
              </span>
              <span className={toneClass[it.tone] ?? "text-zinc-300"}>{it.msg}</span>
              <span className="text-zinc-700">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
