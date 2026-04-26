type Stat = {
  label: string;
  value: string;
  delta?: string;
  tone?: "accent" | "danger" | "warn" | "muted";
  hint?: string;
};

const toneClass: Record<NonNullable<Stat["tone"]>, string> = {
  accent: "text-[color:var(--accent)]",
  danger: "text-[color:var(--danger)]",
  warn: "text-[color:var(--warn)]",
  muted: "text-zinc-300",
};

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="panel relative overflow-hidden p-4">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{s.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-semibold tabular ${toneClass[s.tone ?? "muted"]}`}>
              {s.value}
            </span>
            {s.delta && (
              <span className="text-xs text-zinc-500">{s.delta}</span>
            )}
          </div>
          {s.hint && <p className="mt-1 text-xs text-zinc-500">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}
