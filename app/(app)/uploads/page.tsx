import { Topbar } from "@/components/topbar";
import { UploadCard } from "@/components/upload-card";
import { UploadDropzone } from "@/components/upload-dropzone";
import { readUploads } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const uploads = await readUploads();
  const total = uploads.length;
  const abnormal = uploads.filter((u) => u.status === "abnormal").length;
  const normal = uploads.filter((u) => u.status === "normal").length;
  const analyzing = uploads.filter((u) => u.status === "analyzing").length;

  return (
    <>
      <Topbar
        title="Upload & Classify"
        subtitle="Drop a clip · VideoMAE returns a normal/abnormal verdict in seconds"
      />
      <div className="flex-1 overflow-auto thin-scroll">
        <div className="space-y-6 p-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
            <div className="space-y-3">
              <SectionHead title="New Submission" hint="drag-drop or browse" />
              <UploadDropzone />
            </div>
            <div className="space-y-3">
              <SectionHead title="Submission Stats" hint="lifetime" />
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total" value={String(total)} tone="muted" />
                <Stat label="Abnormal" value={String(abnormal)} tone="danger" />
                <Stat label="Normal" value={String(normal)} tone="ok" />
                <Stat label="Analyzing" value={String(analyzing)} tone="warn" />
              </div>
              <div className="panel p-4 text-xs text-zinc-400">
                <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Pipeline</p>
                <ol className="space-y-1.5 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    upload · multipart · 200 MB cap
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 dot-pulse" />
                    sample 16 frames · normalize · embed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
                    videomae-base classifier · softmax
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    persist verdict · index for dashboard
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHead
              title="Submissions"
              hint={total === 0 ? "no clips yet" : `${total} clip${total === 1 ? "" : "s"} indexed`}
            />
            {total === 0 ? (
              <div className="panel flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-zinc-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </span>
                <p className="text-sm text-zinc-300">Drop your first clip above.</p>
                <p className="text-xs text-zinc-500">Filenames containing &quot;shoplifting&quot; or &quot;theft&quot; trip the demo classifier.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {uploads.map((u) => (
                  <UploadCard key={u.id} upload={u} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{hint}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "danger" | "ok" | "warn";
}) {
  const map: Record<string, string> = {
    muted: "text-white",
    danger: "text-[color:var(--danger)]",
    ok: "text-emerald-300",
    warn: "text-amber-300",
  };
  return (
    <div className="panel p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular ${map[tone]}`}>{value}</p>
    </div>
  );
}
