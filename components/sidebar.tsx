"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "Live Console", icon: GridIcon },
  { href: "/uploads", label: "Upload & Classify", icon: UploadIcon },
  { href: "/alerts", label: "Alert Log", icon: BellIcon },
  { href: "/cameras", label: "Cameras", icon: CamIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/5 bg-[color:var(--panel)]/60 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5">
          <span className="absolute inset-1 rounded-sm border border-[color:var(--accent)]/60" />
          <span className="absolute h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">Kinetic</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Edge Console</p>
        </div>
      </div>

      <nav className="px-3 py-2">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-white/8 text-white ring-1 ring-white/10"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon active={active} />
                  <span>{label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-3 px-4 py-5">
        <div className="panel p-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-[0.18em] text-zinc-500">Model</span>
            <span className="text-emerald-300">live</span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-zinc-300">videomae-base</p>
          <p className="font-mono text-[11px] text-zinc-500">shoplifting · ckpt v3.2</p>
          <p className="mt-2 text-[11px] text-zinc-500">DCSASS · 14k clips · F1 0.92</p>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">
            <span>Sign out</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-[color:var(--accent)]" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function BellIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-[color:var(--accent)]" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function CamIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-[color:var(--accent)]" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}
function UploadIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-[color:var(--accent)]" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
