"""
Download the webadvisor real-time CCTV anomaly dataset and build a fresh
public/dataset/manifest.json for the Live Console grid.

The dashboard does NOT run inference — it just plays whichever clips the
manifest points at and treats `prediction == "shoplifting"` as the abnormal
slot. So the only job here is:
    1. pull the dataset
    2. pick N normal + K shoplifting clips
    3. copy them into public/dataset/
    4. write manifest.json with the shoplifting clips pre-flagged at high
       confidence and the normal ones at low confidence

Usage:
    python scripts/download_webadvisor.py
    python scripts/download_webadvisor.py --normals 32 --abnormals 8 --wipe

Run with --dry-run first if you want to inspect the dataset structure
without copying anything.
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import sys
from pathlib import Path

import kagglehub

DATASET_SLUG = "webadvisor/real-time-anomaly-detection-in-cctv-surveillance"
VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

# Folder-name keywords used to bucket clips.
SHOPLIFTING_KEYS = ("shoplift", "shop")
NORMAL_KEYS = ("normal", "non_anomaly", "non-anomaly", "negative")


def find_videos(root: Path) -> list[Path]:
    return [p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXTS]


def category_for(path: Path, root: Path) -> str:
    """Use the topmost folder under root as the category label. Falls back to
    parent folder name if the file is in a single flat dir."""
    rel = path.relative_to(root)
    parts = rel.parts
    if len(parts) >= 2:
        return parts[0]
    return path.parent.name


def bucket(category: str) -> str | None:
    c = category.lower()
    if any(k in c for k in SHOPLIFTING_KEYS):
        return "shoplifting"
    if any(k in c for k in NORMAL_KEYS):
        return "normal"
    return None


def safe_name(p: Path, idx: int) -> str:
    # Keep extension; rebuild stem to avoid spaces / unicode quirks.
    stem = p.stem.replace(" ", "_").replace("(", "").replace(")", "")
    return f"{idx:03d}_{stem}{p.suffix.lower()}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--normals", type=int, default=32)
    parser.add_argument("--abnormals", type=int, default=8)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument(
        "--out",
        default="public/dataset",
        help="Destination directory inside the Next.js public/ tree.",
    )
    parser.add_argument(
        "--wipe",
        action="store_true",
        help="Delete every existing file in --out before copying the new selection.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect the dataset and print what would be copied. No file changes.",
    )
    args = parser.parse_args()

    random.seed(args.seed)

    print(f"[kinetic] downloading {DATASET_SLUG} via kagglehub …")
    try:
        dataset_path = Path(kagglehub.dataset_download(DATASET_SLUG))
    except Exception as e:
        print(f"[kinetic] kagglehub download failed: {e}", file=sys.stderr)
        print(
            "[kinetic] if this is an auth error, set KAGGLE_USERNAME / KAGGLE_KEY "
            "or drop kaggle.json into ~/.kaggle/",
            file=sys.stderr,
        )
        return 1
    print(f"[kinetic] dataset at: {dataset_path}")

    videos = find_videos(dataset_path)
    if not videos:
        print(f"[kinetic] no video files found under {dataset_path}", file=sys.stderr)
        return 1

    # Bucket every video by category folder.
    by_bucket: dict[str, list[Path]] = {"shoplifting": [], "normal": []}
    by_category_count: dict[str, int] = {}
    for v in videos:
        cat = category_for(v, dataset_path)
        by_category_count[cat] = by_category_count.get(cat, 0) + 1
        b = bucket(cat)
        if b is not None:
            by_bucket[b].append(v)

    print("[kinetic] discovered categories (top-level folder counts):")
    for cat in sorted(by_category_count, key=lambda c: -by_category_count[c]):
        print(f"  {cat}: {by_category_count[cat]}")
    print(
        f"[kinetic] bucketed → shoplifting={len(by_bucket['shoplifting'])}, "
        f"normal={len(by_bucket['normal'])}"
    )

    if not by_bucket["shoplifting"]:
        print(
            "[kinetic] no shoplifting clips matched. Inspect the categories above and "
            "extend SHOPLIFTING_KEYS in the script if needed.",
            file=sys.stderr,
        )
        return 1
    if not by_bucket["normal"]:
        print(
            "[kinetic] no normal clips matched. Inspect the categories above and "
            "extend NORMAL_KEYS in the script if needed.",
            file=sys.stderr,
        )
        return 1

    # Sample. Shuffle deterministically so reruns are stable.
    random.shuffle(by_bucket["shoplifting"])
    random.shuffle(by_bucket["normal"])
    abnormals = by_bucket["shoplifting"][: args.abnormals]
    normals = by_bucket["normal"][: args.normals]
    print(f"[kinetic] picked {len(abnormals)} shoplifting + {len(normals)} normal")

    if args.dry_run:
        print("[kinetic] dry-run — first few picks:")
        for v in (abnormals + normals)[:8]:
            print(f"  {v.relative_to(dataset_path)}")
        return 0

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if args.wipe:
        for child in out.iterdir():
            if child.is_file():
                child.unlink()
            elif child.is_dir():
                shutil.rmtree(child)
        print(f"[kinetic] wiped {out}/")

    clips: list[dict] = []

    # Shoplifting first — these are the ones the dashboard pre-flags.
    for i, src in enumerate(abnormals, start=1):
        fname = safe_name(src, i)
        dst = out / fname
        shutil.copy(src, dst)
        confidence = round(0.78 + random.random() * 0.18, 2)  # 0.78–0.96
        clips.append({
            "id": f"WEB-SHOP-{i:03d}",
            "src": f"/dataset/{fname}",
            "category": "Shoplifting",
            "groundTruth": "shoplifting",
            "prediction": "shoplifting",
            "confidence": confidence,
            "durationSec": 12,
            "description": "Shoplifting clip from webadvisor real-time CCTV anomaly set.",
        })

    for i, src in enumerate(normals, start=1):
        fname = safe_name(src, 1000 + i)
        dst = out / fname
        shutil.copy(src, dst)
        confidence = round(random.random() * 0.18, 2)  # 0.00–0.18
        clips.append({
            "id": f"WEB-NORM-{i:03d}",
            "src": f"/dataset/{fname}",
            "category": "Normal",
            "groundTruth": "normal",
            "prediction": "normal",
            "confidence": confidence,
            "durationSec": 12,
            "description": "Normal CCTV footage from webadvisor real-time anomaly set.",
        })

    manifest_path = out / "manifest.json"
    manifest_path.write_text(json.dumps({"clips": clips}, indent=2))
    print(f"[kinetic] wrote {manifest_path} with {len(clips)} clips")
    print("[kinetic] done. The Live Console will now show 8 normals + 1 shoplifting.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
