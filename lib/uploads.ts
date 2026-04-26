import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type UploadStatus = "analyzing" | "normal" | "abnormal";

export type Upload = {
  id: string;
  originalName: string;
  fileName: string;
  publicUrl: string;
  uploadedAt: string;
  sizeBytes: number;
  status: UploadStatus;
  confidence: number;
  classification: string;
  durationSec: number;
  notes: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const MANIFEST = path.join(DATA_DIR, "uploads.json");
const PUBLIC_UPLOADS = path.join(process.cwd(), "public", "uploads");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_UPLOADS, { recursive: true });
}

export async function readUploads(): Promise<Upload[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(MANIFEST, "utf8");
    const parsed = JSON.parse(raw) as { uploads: Upload[] };
    return parsed.uploads ?? [];
  } catch {
    return [];
  }
}

export async function writeUploads(uploads: Upload[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(MANIFEST, JSON.stringify({ uploads }, null, 2), "utf8");
}

export async function addUpload(file: File): Promise<Upload> {
  await ensureDirs();
  const ext = path.extname(file.name) || ".mp4";
  const id = `UPL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const fileName = `${id}${ext}`;
  const dest = path.join(PUBLIC_UPLOADS, fileName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf);

  const verdict = await runInference(dest);
  const status: UploadStatus = "analyzing";
  const upload: Upload = {
    id,
    originalName: file.name,
    fileName,
    publicUrl: `/uploads/${fileName}`,
    uploadedAt: new Date().toISOString(),
    sizeBytes: buf.byteLength,
    status,
    confidence: verdict.confidence,
    classification: verdict.classification,
    durationSec: 12 + Math.floor(Math.random() * 30),
    notes: verdict.notes,
  };
  const all = await readUploads();
  all.unshift(upload);
  await writeUploads(all);
  return upload;
}

export async function finalizeUpload(id: string): Promise<Upload | null> {
  const all = await readUploads();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const cur = all[idx];
  if (cur.status !== "analyzing") return cur;
  const next: Upload = {
    ...cur,
    status: cur.confidence >= 0.5 ? "abnormal" : "normal",
  };
  all[idx] = next;
  await writeUploads(all);
  return next;
}

export async function removeUpload(id: string): Promise<void> {
  const all = await readUploads();
  const target = all.find((u) => u.id === id);
  const next = all.filter((u) => u.id !== id);
  await writeUploads(next);
  if (target) {
    try {
      await fs.unlink(path.join(PUBLIC_UPLOADS, target.fileName));
    } catch {
      // ignore
    }
  }
}

type InferResult = { confidence: number; classification: string; notes: string };

// Calls scripts/infer.py to run the fine-tuned VideoMAE checkpoint against the
// uploaded clip. Blocks the upload response until inference returns — first
// call is slow (model load + checkpoint), subsequent calls are faster but
// still cold per request because we spawn a fresh Python process each time.
async function runInference(videoPath: string): Promise<InferResult> {
  const python = process.env.KINETIC_PYTHON ?? "python3";
  const script = path.join(process.cwd(), "scripts", "infer.py");
  try {
    const { stdout } = await execFileAsync(
      python,
      [script, "--video", videoPath],
      { cwd: process.cwd(), maxBuffer: 8 * 1024 * 1024, timeout: 5 * 60 * 1000 },
    );
    const parsed = JSON.parse(stdout.trim()) as {
      label?: "shoplifting" | "normal";
      shoplifting_prob?: number;
      mean_top3_prob?: number;
      max_segment?: { start_sec: number; end_sec: number; shoplifting_prob: number };
      segments?: { start_sec: number; end_sec: number; shoplifting_prob: number }[];
      error?: string;
    };
    if (parsed.error || typeof parsed.shoplifting_prob !== "number") {
      return {
        confidence: 0,
        classification: "Inference failed",
        notes: parsed.error ?? "infer.py returned no probability.",
      };
    }
    const p = parsed.shoplifting_prob;
    const isAbnormal = parsed.label === "shoplifting" || p >= 0.5;
    const segCount = parsed.segments?.length ?? 0;
    const maxSeg = parsed.max_segment;
    const baseNote = isAbnormal
      ? `VideoMAE shoplifting probability ${p.toFixed(3)}`
      : `VideoMAE shoplifting probability ${p.toFixed(3)} — below threshold`;
    const segNote =
      segCount > 0 && maxSeg
        ? ` (max across ${segCount}× 2s windows, peak ${maxSeg.start_sec.toFixed(1)}–${maxSeg.end_sec.toFixed(1)}s).`
        : ".";
    return {
      confidence: Number(p.toFixed(2)),
      classification: isAbnormal ? "Concealment / Shoplifting" : "Routine Activity",
      notes: baseNote + segNote,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      confidence: 0,
      classification: "Inference failed",
      notes: message.slice(0, 500),
    };
  }
}
