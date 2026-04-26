import Link from "next/link";
import { LiveGrid } from "@/components/live-grid";
import { StatsStrip } from "@/components/stats-strip";
import { Topbar } from "@/components/topbar";
import { UploadCard } from "@/components/upload-card";
import { CAMERAS } from "@/lib/cameras";
import { getDatasetClips } from "@/lib/dataset";
import { readUploads } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [uploads, clips] = await Promise.all([readUploads(), getDatasetClips()]);
  const totalCameras = CAMERAS.length;
  const datasetClips = clips.length;

  const stats = [
    { label: "Cameras Online", value: `${totalCameras}/9`, tone: "accent" as const, hint: "edge inference" },
    { label: "Abnormal On Screen", value: "1", tone: "danger" as const, hint: "of 9 live feeds" },
    { label: "Dataset Pool", value: String(datasetClips), tone: "muted" as const, hint: "DCSASS clips queued" },
    { label: "Uploads · indexed", value: String(uploads.length), tone: "muted" as const, hint: "lifetime classified" },
  ];

  return (
    <>
      <Topbar
        title="Live Console"
        subtitle="9 feeds · 8 normal + 1 abnormal · cycling DCSASS clips on loop"
      />
      <div className="flex-1 overflow-auto thin-scroll">
        <div className="space-y-6 p-8">
          <StatsStrip stats={stats} />

          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  Camera Grid
                </h2>
                <p className="text-xs text-zinc-500">
                  9 feeds · always 8 normal and 1 abnormal · new random clip when each tile finishes
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                realtime · auto-rotating
              </p>
            </div>
            <LiveGrid cameras={CAMERAS} clips={clips} />
          </div>

          {uploads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-white">Recent Uploads</h2>
                  <p className="text-xs text-zinc-500">Operator-submitted clips · classified by VideoMAE</p>
                </div>
                <Link
                  href="/uploads"
                  className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open Upload Console →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {uploads.slice(0, 6).map((u) => (
                  <UploadCard key={u.id} upload={u} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
