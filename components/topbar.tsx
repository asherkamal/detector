"use client";

import { useEffect, useState } from "react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-[color:var(--panel)]/40 px-8 py-5 backdrop-blur">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 dot-pulse" />
            online
          </span>
        </div>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs text-zinc-400 md:flex">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span>Search alerts, cameras, plates…</span>
          <span className="ml-2 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">⌘K</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2">
          <span className="font-mono text-sm tabular text-white">{now || "--:--:--"}</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">UTC-04</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)]/60 to-[color:var(--accent-2)]/60 text-[11px] font-semibold text-black">
            DR
          </span>
          <div className="text-xs leading-tight">
            <p className="text-white">Operator</p>
            <p className="text-zinc-500">Target #4421</p>
          </div>
        </div>
      </div>
    </header>
  );
}
