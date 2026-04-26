import { DetectionWall } from "@/components/detection-wall";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full blur-3xl drift-slow"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124,92,255,0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-20 h-[420px] w-[820px] rounded-full blur-3xl drift-slow"
        style={{
          background:
            "radial-gradient(circle at center, rgba(52,245,197,0.22), transparent 60%)",
          animationDelay: "-9s",
        }}
        aria-hidden
      />

      {/* LEFT — live detection wall */}
      <section className="relative hidden min-h-full flex-1 lg:block">
        <div className="absolute inset-0 z-0">
          <DetectionWall />
        </div>
        {/* darken edge for readability */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-r from-transparent to-[color:var(--background)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[color:var(--background)] to-transparent" />

        {/* HUD overlay */}
        <div className="pointer-events-none absolute left-8 top-8 z-20 flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Kinetic</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              edge threat console
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-8 right-12 z-20 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          <Pill tone="red">3 abnormal</Pill>
          <Pill tone="amber">2 analyzing</Pill>
          <Pill tone="emerald">4 normal</Pill>
          <span className="ml-auto font-mono text-zinc-500 flicker">
            ▌ videomae-base · ckpt v3.2 · 42ms
          </span>
        </div>
      </section>

      {/* RIGHT — auth panel */}
      <section className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[520px] lg:border-l lg:border-white/5 lg:bg-[color:var(--panel)]/40 lg:backdrop-blur-xl">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="text-sm font-semibold text-white">Kinetic</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--accent)]">
            Restricted Access
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
            Sign in to the <span className="shimmer-text">detection</span> console.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Real-time shoplifting classification across every enrolled camera.
            Authenticate to view abnormal events, route alerts, and queue clips
            for inference.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.18em]">
            <Stat label="Normal" value="78%" tone="emerald" />
            <Stat label="Abnormal" value="14%" tone="red" />
            <Stat label="Analyzing" value="8%" tone="amber" />
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-white/10 bg-black/30 p-4 text-xs text-zinc-400">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Demo credentials
            </p>
            <p className="font-mono">
              <span className="text-zinc-300">dhruv@target.com</span>
              <span className="mx-2 text-zinc-600">·</span>
              <span className="text-zinc-300">target</span>
            </p>
          </div>

          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            Kinetic · Target #4421 — Cambridge · 2026
          </p>
        </div>
      </section>
    </div>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 shadow-[0_0_30px_-6px_rgba(52,245,197,0.6)]">
      <span className="absolute inset-1.5 rounded-sm border border-[color:var(--accent)]/60" />
      <span className="absolute h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
    </span>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "red" | "amber" | "emerald" }) {
  const map: Record<string, string> = {
    red: "bg-red-500/15 text-red-300 ring-red-500/40",
    amber: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
    emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
  };
  return (
    <span className={`rounded-md px-2 py-1 ring-1 ${map[tone]}`}>{children}</span>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "amber" | "emerald";
}) {
  const map: Record<string, { text: string; ring: string; bg: string }> = {
    red: { text: "text-red-300", ring: "ring-red-500/30", bg: "bg-red-500/10" },
    amber: { text: "text-amber-300", ring: "ring-amber-500/30", bg: "bg-amber-500/10" },
    emerald: { text: "text-emerald-300", ring: "ring-emerald-500/30", bg: "bg-emerald-500/10" },
  };
  const t = map[tone];
  return (
    <div className={`rounded-md px-3 py-2 ring-1 ${t.bg} ${t.ring}`}>
      <p className="text-[9px] tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-base font-semibold tabular ${t.text}`}>{value}</p>
    </div>
  );
}
