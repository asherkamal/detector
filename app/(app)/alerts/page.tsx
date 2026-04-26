import { Topbar } from "@/components/topbar";
import { ALERTS, alertStatusTone, type Alert } from "@/lib/alerts";

export default function AlertsPage() {
  const total = ALERTS.length;
  const abnormal = ALERTS.filter((a) => a.status === "abnormal").length;
  const resolved = ALERTS.filter((a) => a.status === "resolved").length;
  const falsePositive = ALERTS.filter((a) => a.status === "false-positive").length;
  const calls911 = ALERTS.filter((a) => a.action === "Called 911").length;
  const avgConf = total === 0 ? "—" : (
    ALERTS.reduce((a, x) => a + x.confidence, 0) / total
  ).toFixed(2);

  return (
    <>
      <Topbar
        title="Alert Log"
        subtitle="Past 24 hours · auto-actioned by the on-device model"
      />
      <div className="flex-1 overflow-auto thin-scroll">
        <div className="space-y-6 p-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Total" value={String(total)} tone="muted" />
            <Stat label="Abnormal" value={String(abnormal)} tone="danger" />
            <Stat label="Resolved" value={String(resolved)} tone="info" />
            <Stat label="False Positive" value={String(falsePositive)} tone="muted" />
            <Stat label="911 Calls" value={String(calls911)} tone="danger" />
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
                <span>Past Alerts</span>
                <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 ring-1 ring-white/10">
                  avg confidence {avgConf}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FilterChip label="All" active />
                <FilterChip label="Abnormal" />
                <FilterChip label="Resolved" />
                <FilterChip label="False Positive" />
              </div>
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm text-zinc-400">No alerts logged yet.</p>
                <p className="text-xs text-zinc-600">Alerts will appear here once the live feed detects events.</p>
              </div>
            ) : (
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    <tr>
                      <Th>Alert</Th>
                      <Th>Time</Th>
                      <Th>Camera</Th>
                      <Th>Status</Th>
                      <Th>Confidence</Th>
                      <Th>Classification</Th>
                      <Th>Action Taken</Th>
                      <Th>Responder</Th>
                      <Th align="right">Duration</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ALERTS.map((a) => (
                      <Row key={a.id} alert={a} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "danger" | "info";
}) {
  const cls =
    tone === "danger"
      ? "text-[color:var(--danger)]"
      : tone === "info"
      ? "text-sky-300"
      : "text-white";
  return (
    <div className="panel p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular ${cls}`}>{value}</p>
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`rounded-full px-3 py-1 text-[11px] tracking-wide transition ${
        active
          ? "bg-white/10 text-white ring-1 ring-white/15"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function Row({ alert }: { alert: Alert }) {
  const tone = alertStatusTone(alert.status);
  const actionTone = actionToTone(alert.action);

  return (
    <tr className="group transition hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${
            alert.status === "abnormal" ? "bg-red-400 dot-pulse" :
            alert.status === "resolved" ? "bg-sky-400" :
            alert.status === "false-positive" ? "bg-zinc-500" : "bg-emerald-400"
          }`} />
          <span className="font-mono text-xs text-zinc-300">{alert.id}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-400 tabular">{alert.timestamp}</td>
      <td className="px-4 py-3">
        <p className="text-white">{alert.cameraLabel}</p>
        <p className="font-mono text-[11px] text-zinc-500">{alert.cameraId}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
          {alert.status === "false-positive" ? "FALSE +" : alert.status.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <ConfidenceBar value={alert.confidence} />
      </td>
      <td className="px-4 py-3 text-zinc-300">{alert.classification}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] ring-1 ${actionTone}`}>
          {alert.action}
        </span>
      </td>
      <td className="px-4 py-3 text-zinc-400">{alert.responder}</td>
      <td className="px-4 py-3 text-right font-mono text-zinc-400 tabular">{alert.durationSec}s</td>
    </tr>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const tone =
    value > 0.8
      ? "var(--danger)"
      : value > 0.5
      ? "var(--warn)"
      : "var(--accent)";
  return (
    <div className="flex w-32 items-center gap-2">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${value * 100}%`, background: tone }}
        />
      </div>
      <span className="w-8 font-mono text-[11px] tabular text-zinc-300">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function actionToTone(action: string): string {
  if (action === "Called 911") return "bg-red-500/15 text-red-300 ring-red-500/30";
  if (action === "Auto-locked Doors") return "bg-orange-500/15 text-orange-300 ring-orange-500/30";
  if (action === "Dispatched LP Officer") return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  if (action === "Notified Manager") return "bg-sky-500/15 text-sky-300 ring-sky-500/30";
  if (action === "SMS to Owner") return "bg-violet-500/15 text-violet-300 ring-violet-500/30";
  if (action === "Escalated to Regional") return "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30";
  return "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30";
}
