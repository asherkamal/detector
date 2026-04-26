"""
Walk a DCSASS dataset directory, sample N random clips per category,
copy them into public/dataset/, run the fine-tuned VideoMAE on each,
and write public/dataset/manifest.json.

The dashboard reads manifest.json and rotates clips through its 9 tiles.
If this script never runs, the dashboard falls back to the seed list in
lib/dataset.ts (synthetic feeds with DCSASS-style metadata).

Usage:
    python scripts/prepare_dataset.py \
        --dataset /path/to/DCSASS \
        --weights models/best_videomae_shoplifting.pt \
        --per-category 12

Notes on DCSASS layout (Kaggle: mateohervas/dcsass-dataset):
    DCSASS/
        Shoplifting/Shoplifting001_x264.mp4
        Shoplifting/Shoplifting002_x264.mp4
        ...
        NormalVideos/Normal_Videos_001_x264.mp4
        ...
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import sys
from pathlib import Path
from typing import List, Optional


VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv"}
TARGET_CATEGORIES = ["Shoplifting", "NormalVideos"]


def _imports():
    import torch
    from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
    try:
        from decord import VideoReader, cpu
    except Exception:
        VideoReader = None
        cpu = None
    return torch, VideoMAEImageProcessor, VideoMAEForVideoClassification, VideoReader, cpu


def sample_indices(total: int, num: int = 16) -> List[int]:
    if total <= num:
        return list(range(total)) + [total - 1] * (num - total)
    step = total / num
    return [int(i * step) for i in range(num)]


def load_clip(path: Path, num_frames: int = 16):
    _, _, _, VideoReader, cpu = _imports()
    if VideoReader is None:
        raise RuntimeError("decord required: pip install decord")
    vr = VideoReader(str(path), ctx=cpu(0))
    idx = sample_indices(len(vr), num_frames)
    return vr.get_batch(idx).asnumpy(), len(vr) / max(vr.get_avg_fps(), 1.0)


def find_clips(dataset: Path, category: str, n: int) -> List[Path]:
    candidates: List[Path] = []
    for sub in dataset.rglob("*"):
        if sub.is_file() and sub.suffix.lower() in VIDEO_EXT and category.lower() in sub.parent.name.lower():
            candidates.append(sub)
    random.shuffle(candidates)
    return candidates[:n]


def normalize_category(category: str) -> str:
    if "shop" in category.lower():
        return "Shoplifting"
    return "Normal"


def description_for(category: str, idx: int) -> str:
    if category == "Shoplifting":
        return random.choice([
            "Concealment pattern detected.",
            "Tag tampering near rack.",
            "Repeated handling without selection.",
            "Bag swap at point of sale.",
            "Box tampering, electronics aisle.",
        ])
    return random.choice([
        "Customer browsing aisle.",
        "Routine cashier interaction.",
        "Shelf restocking activity.",
        "Comparing products.",
        "Returning item to shelf.",
    ])


def run(
    dataset: Path,
    weights: Path,
    out_dir: Path,
    manifest: Path,
    per_category: int,
    device_override: Optional[str],
) -> None:
    torch, VideoMAEImageProcessor, VideoMAEForVideoClassification, _, _ = _imports()

    device = device_override or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[kinetic] device={device}")

    processor = VideoMAEImageProcessor.from_pretrained("MCG-NJU/videomae-base")
    model = VideoMAEForVideoClassification.from_pretrained(
        "MCG-NJU/videomae-base",
        num_labels=2,
        id2label={0: "normal", 1: "shoplifting"},
        label2id={"normal": 0, "shoplifting": 1},
        ignore_mismatched_sizes=True,
    )
    state = torch.load(weights, map_location=device)
    if isinstance(state, dict) and "state_dict" in state:
        state = state["state_dict"]
    model.load_state_dict(state, strict=False)
    model.eval().to(device)

    out_dir.mkdir(parents=True, exist_ok=True)
    clips_meta = []
    for category in TARGET_CATEGORIES:
        picked = find_clips(dataset, category, per_category)
        if not picked:
            print(f"[kinetic] no clips found for category={category}")
        for src in picked:
            try:
                frames, duration = load_clip(src)
                inputs = processor(list(frames), return_tensors="pt").to(device)
                with torch.no_grad():
                    logits = model(**inputs).logits
                probs = torch.softmax(logits, dim=-1)[0].tolist()
                shop_p = float(probs[1])
                pred = "shoplifting" if shop_p >= 0.5 else "normal"
                norm_cat = normalize_category(category)
                truth = "shoplifting" if norm_cat == "Shoplifting" else "normal"

                dest = out_dir / src.name
                if not dest.exists():
                    shutil.copy2(src, dest)

                clips_meta.append({
                    "id": f"DCSASS-{src.stem.upper()}",
                    "src": f"/dataset/{src.name}",
                    "category": norm_cat,
                    "groundTruth": truth,
                    "prediction": pred,
                    "confidence": round(shop_p if pred == "shoplifting" else 1.0 - shop_p, 4),
                    "durationSec": int(round(duration)) or 12,
                    "description": description_for(norm_cat, len(clips_meta)),
                })
                print(f"[kinetic] {src.name}: pred={pred} p={shop_p:.3f}")
            except Exception as e:
                print(f"[kinetic] {src.name}: ERROR {e}", file=sys.stderr)

    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps({"clips": clips_meta}, indent=2))
    print(f"[kinetic] wrote {manifest} ({len(clips_meta)} clips)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, help="Path to the DCSASS dataset root")
    parser.add_argument("--weights", default="models/best_videomae_shoplifting.pt")
    parser.add_argument("--out-dir", default="public/dataset")
    parser.add_argument("--manifest", default="public/dataset/manifest.json")
    parser.add_argument("--per-category", type=int, default=12)
    parser.add_argument("--device", default=None, help="Force device, e.g. cuda or cpu")
    args = parser.parse_args()

    weights = Path(args.weights)
    if not weights.exists() or weights.stat().st_size == 0:
        alt = Path("src/best_videomae_shoplifting.pt")
        if alt.exists() and alt.stat().st_size > 0:
            weights = alt
        else:
            print(f"[kinetic] checkpoint not found at {args.weights}", file=sys.stderr)
            sys.exit(1)

    run(
        dataset=Path(args.dataset),
        weights=weights,
        out_dir=Path(args.out_dir),
        manifest=Path(args.manifest),
        per_category=args.per_category,
        device_override=args.device,
    )


if __name__ == "__main__":
    main()
