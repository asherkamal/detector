import { Topbar } from "@/components/topbar";
import { CAMERAS, statusTone } from "@/lib/cameras";

export default function CamerasPage() {
  return (
    <>
      <Topbar
        title="Cameras"
        subtitle="Edge devices · firmware 2026.04 · all enrolled"
      />
      <div className="flex-1 overflow-auto thin-scroll">
        <div className="space-y-6 p-8">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-sm">
              <div className="flex items-center gap-2 text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
                <span>Enrolled Devices</span>
                <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 ring-1 ring-white/10">
                  {CAMERAS.length} units
                </span>
              </div>
              <span className="text-xs text-zinc-500">Target #4421 — Cambridge</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Camera</th>
                  <th className="px-4 py-3 font-medium">Zone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stream</th>
                  <th className="px-4 py-3 font-medium">Uptime</th>
                  <th className="px-4 py-3 font-medium">Last Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {CAMERAS.map((c) => {
                  const tone = statusTone(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{c.id}</td>
                      <td className="px-4 py-3 text-white">{c.label}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.zone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                          {tone.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {c.fps} fps · {c.resolution}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400 tabular">
                        {c.uptimeHours}h
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{c.lastEvent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
