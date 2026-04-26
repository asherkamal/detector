import { promises as fs } from "node:fs";
import path from "node:path";

export type ClipPrediction = "normal" | "shoplifting";

export type DatasetClip = {
  id: string;
  src: string;
  category: string;
  groundTruth: ClipPrediction;
  prediction: ClipPrediction;
  confidence: number;
  durationSec: number;
  description: string;
};

const MANIFEST = path.join(process.cwd(), "public", "dataset", "manifest.json");

export async function getDatasetClips(): Promise<DatasetClip[]> {
  try {
    const raw = await fs.readFile(MANIFEST, "utf8");
    const parsed = JSON.parse(raw) as { clips: DatasetClip[] };
    if (Array.isArray(parsed.clips) && parsed.clips.length > 0) return parsed.clips;
  } catch {
    // fall through to seed
  }
  return SEED;
}

// Seed mirrors DCSASS Kaggle clip naming so the demo runs without any
// downloaded files — tiles fall back to the synthetic feed when src 404s.
const SEED: DatasetClip[] = [
  // SHOPLIFTING — model predicts shoplifting with high confidence
  { id: "DCSASS-SHOP-001", src: "/dataset/Shoplifting001_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.94, durationSec: 14, description: "Subject conceals fragrance box in tote." },
  { id: "DCSASS-SHOP-005", src: "/dataset/Shoplifting005_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.91, durationSec: 11, description: "Tag tampering at apparel rack." },
  { id: "DCSASS-SHOP-009", src: "/dataset/Shoplifting009_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.88, durationSec: 18, description: "Items placed in jacket near checkout." },
  { id: "DCSASS-SHOP-014", src: "/dataset/Shoplifting014_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.82, durationSec: 9, description: "Box tampering, electronics aisle." },
  { id: "DCSASS-SHOP-018", src: "/dataset/Shoplifting018_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.79, durationSec: 12, description: "Bottle concealment, liquor aisle." },
  { id: "DCSASS-SHOP-022", src: "/dataset/Shoplifting022_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.86, durationSec: 16, description: "Bag swap at self-checkout." },
  { id: "DCSASS-SHOP-027", src: "/dataset/Shoplifting027_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.74, durationSec: 13, description: "Repeat handling without selection." },
  { id: "DCSASS-SHOP-031", src: "/dataset/Shoplifting031_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.92, durationSec: 10, description: "Fitting room concealment." },
  { id: "DCSASS-SHOP-038", src: "/dataset/Shoplifting038_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.69, durationSec: 15, description: "Group distraction tactic." },

  // NORMAL — model predicts normal
  { id: "DCSASS-NORM-002", src: "/dataset/Normal_Videos002_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.07, durationSec: 14, description: "Customer browsing aisle." },
  { id: "DCSASS-NORM-007", src: "/dataset/Normal_Videos007_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.05, durationSec: 12, description: "Cashier ringing items." },
  { id: "DCSASS-NORM-012", src: "/dataset/Normal_Videos012_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.11, durationSec: 18, description: "Routine shelf restocking." },
  { id: "DCSASS-NORM-019", src: "/dataset/Normal_Videos019_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.08, durationSec: 16, description: "Customer comparing products." },
  { id: "DCSASS-NORM-024", src: "/dataset/Normal_Videos024_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.04, durationSec: 11, description: "Family group walking aisle." },
  { id: "DCSASS-NORM-029", src: "/dataset/Normal_Videos029_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.13, durationSec: 13, description: "Self-checkout payment." },
  { id: "DCSASS-NORM-035", src: "/dataset/Normal_Videos035_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.06, durationSec: 17, description: "Cart navigation." },
  { id: "DCSASS-NORM-041", src: "/dataset/Normal_Videos041_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.09, durationSec: 12, description: "Returning item to shelf." },
  { id: "DCSASS-NORM-047", src: "/dataset/Normal_Videos047_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.10, durationSec: 14, description: "Asking associate for help." },

  // BORDERLINE — lower-confidence flags, exercise the analyzing/uncertain path
  { id: "DCSASS-SHOP-044", src: "/dataset/Shoplifting044_x264.mp4", category: "Shoplifting", groundTruth: "shoplifting", prediction: "shoplifting", confidence: 0.58, durationSec: 12, description: "Loitering near high-value display." },
  { id: "DCSASS-NORM-053", src: "/dataset/Normal_Videos053_x264.mp4", category: "Normal", groundTruth: "normal", prediction: "normal", confidence: 0.32, durationSec: 15, description: "Browsing with bag — model uncertain." },
];
