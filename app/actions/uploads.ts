"use server";

import { revalidatePath } from "next/cache";
import {
  addUpload,
  finalizeUpload,
  removeUpload,
  type Upload,
} from "@/lib/uploads";

export type UploadResult =
  | { ok: true; upload: Upload }
  | { ok: false; error: string };

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_EXT = [".mp4", ".mov", ".webm", ".mkv", ".avi"];

export async function uploadVideoAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("video");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return { ok: false, error: `Unsupported file type. Use ${ALLOWED_EXT.join(", ")}.` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File exceeds 200 MB limit." };
  }
  try {
    const upload = await addUpload(file);
    revalidatePath("/uploads");
    revalidatePath("/dashboard");
    return { ok: true, upload };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." };
  }
}

export async function finalizeUploadAction(id: string): Promise<Upload | null> {
  const result = await finalizeUpload(id);
  revalidatePath("/uploads");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteUploadAction(id: string): Promise<void> {
  await removeUpload(id);
  revalidatePath("/uploads");
  revalidatePath("/dashboard");
}
