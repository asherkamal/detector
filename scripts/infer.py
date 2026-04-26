"""
Run the fine-tuned VideoMAE shoplifting model against a directory of clips
and write per-clip predictions to public/inference.json so the dashboard
can pick them up.

Usage:
    python scripts/infer.py --videos public/videos --weights models/best_videomae_shoplifting.pt

The dashboard reads public/inference.json. If the file is missing, it falls
back to the deterministic seed in lib/cameras.ts — safe for offline demo.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List

# Lazy import torch / transformers / frame readers so the script can at least
# print a helpful message when run in an environment without them.
def _lazy_imports():
    import torch
    from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
    try:
        from decord import VideoReader, cpu
    except Exception:
        VideoReader = None
        cpu = None
    try:
        import cv2
    except Exception:
        cv2 = None
    return torch, VideoMAEImageProcessor, VideoMAEForVideoClassification, VideoReader, cpu, cv2


def sample_indices(total: int, num: int = 16) -> List[int]:
    if total <= num:
        return list(range(total)) + [total - 1] * (num - total)
    step = total / num
    return [int(i * step) for i in range(num)]


def load_clip(path: Path, num_frames: int = 16):
    _, _, _, VideoReader, cpu, cv2 = _lazy_imports()
    if VideoReader is not None:
        vr = VideoReader(str(path), ctx=cpu(0))
        idx = sample_indices(len(vr), num_frames)
        return vr.get_batch(idx).asnumpy()  # (T, H, W, C) uint8
    if cv2 is not None:
        cap = cv2.VideoCapture(str(path))
        try:
            total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            if total <= 0:
                # Fallback: walk the stream once to count
                frames_all = []
                while True:
                    ok, fr = cap.read()
                    if not ok:
                        break
                    frames_all.append(fr)
                if not frames_all:
                    raise RuntimeError(f"no frames decoded from {path}")
                idx = sample_indices(len(frames_all), num_frames)
                picked = [frames_all[i] for i in idx]
            else:
                idx = set(sample_indices(total, num_frames))
                picked_map = {}
                want = sorted(idx)
                next_want = want[0]
                want_iter = iter(want[1:])
                i = 0
                while True:
                    ok, fr = cap.read()
                    if not ok:
                        break
                    if i == next_want:
                        picked_map[i] = fr
                        nxt = next(want_iter, None)
                        if nxt is None:
                            break
                        next_want = nxt
                    i += 1
                picked = [picked_map[k] for k in want if k in picked_map]
                if len(picked) < num_frames and picked:
                    picked += [picked[-1]] * (num_frames - len(picked))
            import numpy as np
            # cv2 returns BGR; VideoMAE processor expects RGB
            rgb = [cv2.cvtColor(f, cv2.COLOR_BGR2RGB) for f in picked]
            return np.stack(rgb, axis=0)
        finally:
            cap.release()
    raise RuntimeError(
        "Need either `decord` or `opencv-python` installed to read video frames."
    )


def _build_model(weights: Path):
    torch, VideoMAEImageProcessor, VideoMAEForVideoClassification, _, _, _ = _lazy_imports()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    processor = VideoMAEImageProcessor.from_pretrained("MCG-NJU/videomae-base")
    model = VideoMAEForVideoClassification.from_pretrained(
        "MCG-NJU/videomae-base",
        num_labels=2,
        id2label={0: "normal", 1: "shoplifting"},
        label2id={"normal": 0, "shoplifting": 1},
        ignore_mismatched_sizes=True,
    )
    state = torch.load(weights, map_location=device, weights_only=False)
    # Training script saves under "model_state_dict"; some other tooling uses
    # "state_dict". Unwrap whichever wrapper is present.
    if isinstance(state, dict):
        for k in ("model_state_dict", "state_dict"):
            if k in state and isinstance(state[k], dict):
                state = state[k]
                break
    missing, unexpected = model.load_state_dict(state, strict=False)
    # Loud surface — silent strict=False is what was masking a bad load.
    if missing:
        print(f"[kinetic] missing keys ({len(missing)}): {missing[:3]}...", file=sys.stderr)
    if unexpected:
        print(f"[kinetic] unexpected keys ({len(unexpected)}): {unexpected[:3]}...", file=sys.stderr)
    model.eval().to(device)
    return torch, processor, model, device


def predict_one(weights: Path, video: Path) -> dict:
    torch, processor, model, device = _build_model(weights)
    frames = load_clip(video)
    inputs = processor(list(frames), return_tensors="pt").to(device)
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=-1)[0].tolist()
    shoplifting_p = float(probs[1])
    label = "shoplifting" if shoplifting_p >= 0.5 else "normal"
    return {
        "file": video.name,
        "label": label,
        "shoplifting_prob": round(shoplifting_p, 4),
        "probs": [round(x, 4) for x in probs],
    }


def _video_meta(path: Path):
    """Returns (fps, total_frames). Falls back to a sequential walk if the
    container lies about frame count (common for some webm/mkv encodings)."""
    _, _, _, _, _, cv2 = _lazy_imports()
    if cv2 is None:
        raise RuntimeError("opencv-python is required for segmented inference.")
    cap = cv2.VideoCapture(str(path))
    try:
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    finally:
        cap.release()
    if fps <= 0:
        fps = 30.0  # reasonable default for unknown containers
    if total <= 0:
        # Walk once to count
        cap = cv2.VideoCapture(str(path))
        try:
            n = 0
            while True:
                ok, _ = cap.read()
                if not ok:
                    break
                n += 1
            total = n
        finally:
            cap.release()
    return fps, total


def _windows_for(fps: float, total_frames: int, win_sec: float, stride_sec: float):
    win_f = max(1, int(round(win_sec * fps)))
    stride_f = max(1, int(round(stride_sec * fps)))
    if total_frames <= win_f:
        return [(0, total_frames)]
    starts = list(range(0, total_frames - win_f + 1, stride_f))
    # Make sure the tail of the video is covered
    if starts and starts[-1] + win_f < total_frames:
        starts.append(total_frames - win_f)
    return [(s, s + win_f) for s in starts]


def _gather_frames(path: Path, indices):
    """Single sequential pass that returns {abs_frame_idx: rgb_array} for the
    requested indices. Avoids unreliable seek behavior across codecs."""
    _, _, _, _, _, cv2 = _lazy_imports()
    target = sorted(set(indices))
    out = {}
    if not target:
        return out
    cap = cv2.VideoCapture(str(path))
    try:
        cur = 0
        ti = 0
        nxt = target[ti]
        while True:
            ok, fr = cap.read()
            if not ok:
                break
            if cur == nxt:
                out[cur] = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
                ti += 1
                if ti >= len(target):
                    break
                nxt = target[ti]
            cur += 1
    finally:
        cap.release()
    return out


def predict_segments(
    weights: Path,
    video: Path,
    win_sec: float = 2.0,
    stride_sec: float = 2.0,
    num_frames: int = 16,
) -> dict:
    """Slide a `win_sec` window across the video with `stride_sec` step. Run
    VideoMAE on each window (16 evenly-sampled frames within that window) so
    we feed the model clips of the same duration it was fine-tuned on.
    Aggregates: max-pool for the headline (any suspicious window flags the
    clip), mean-of-top-3 for a smoother score."""
    import numpy as np
    fps, total = _video_meta(video)
    if total <= 0:
        raise RuntimeError(f"could not decode any frames from {video}")

    windows = _windows_for(fps, total, win_sec, stride_sec)
    needed = []
    per_window_idx = []
    for (s, e) in windows:
        rel = sample_indices(e - s, num_frames)
        absolute = [s + i for i in rel]
        per_window_idx.append(absolute)
        needed.extend(absolute)
    frame_map = _gather_frames(video, needed)

    torch, processor, model, device = _build_model(weights)

    segments = []
    for (s, e), idxs in zip(windows, per_window_idx):
        frames = []
        for i in idxs:
            if i in frame_map:
                frames.append(frame_map[i])
            elif frames:
                frames.append(frames[-1])  # repeat last if a frame is missing
        if len(frames) < num_frames:
            continue
        arr = np.stack(frames, axis=0)
        inputs = processor(list(arr), return_tensors="pt").to(device)
        with torch.no_grad():
            logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0].tolist()
        segments.append({
            "start_sec": round(s / fps, 2),
            "end_sec": round(e / fps, 2),
            "shoplifting_prob": round(float(probs[1]), 4),
        })

    if not segments:
        # Couldn't extract enough frames for any window — fall back to the
        # whole-clip predictor so we still return something useful.
        return predict_one(weights, video)

    by_prob = sorted(segments, key=lambda x: x["shoplifting_prob"], reverse=True)
    max_seg = by_prob[0]
    top3 = by_prob[:3]
    mean_top3 = sum(x["shoplifting_prob"] for x in top3) / len(top3)
    headline = float(max_seg["shoplifting_prob"])
    label = "shoplifting" if headline >= 0.5 else "normal"
    return {
        "file": video.name,
        "label": label,
        "shoplifting_prob": round(headline, 4),
        "mean_top3_prob": round(mean_top3, 4),
        "max_segment": max_seg,
        "segments": segments,
        "fps": round(fps, 2),
        "total_frames": total,
        "win_sec": win_sec,
        "stride_sec": stride_sec,
    }


def run(weights: Path, videos_dir: Path, out_path: Path) -> None:
    torch, VideoMAEImageProcessor, VideoMAEForVideoClassification, _, _, _ = _lazy_imports()

    device = "cuda" if torch.cuda.is_available() else "cpu"
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

    results = []
    paths = sorted([p for p in videos_dir.iterdir() if p.suffix.lower() in {".mp4", ".mov", ".avi", ".mkv"}])
    if not paths:
        print(f"[kinetic] no videos found in {videos_dir}", file=sys.stderr)

    for p in paths:
        try:
            frames = load_clip(p)
            inputs = processor(list(frames), return_tensors="pt").to(device)
            with torch.no_grad():
                logits = model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)[0].tolist()
            shoplifting_p = float(probs[1])
            label = "shoplifting" if shoplifting_p >= 0.5 else "normal"
            results.append({
                "file": p.name,
                "label": label,
                "shoplifting_prob": round(shoplifting_p, 4),
                "probs": [round(x, 4) for x in probs],
            })
            print(f"[kinetic] {p.name}: {label} (p={shoplifting_p:.3f})")
        except Exception as e:
            results.append({"file": p.name, "error": str(e)})
            print(f"[kinetic] {p.name}: ERROR {e}", file=sys.stderr)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps({"results": results}, indent=2))
    print(f"[kinetic] wrote {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", default="models/best_videomae_shoplifting.pt")
    parser.add_argument("--videos", default="public/videos")
    parser.add_argument("--out", default="public/inference.json")
    parser.add_argument(
        "--video",
        default=None,
        help="Single video path. When set, prints a JSON result to stdout instead of scanning a dir.",
    )
    parser.add_argument("--win-sec", type=float, default=2.0, help="Window length in seconds.")
    parser.add_argument(
        "--stride-sec",
        type=float,
        default=2.0,
        help="Stride between windows in seconds. Equal to --win-sec for non-overlapping.",
    )
    parser.add_argument(
        "--no-segments",
        action="store_true",
        help="Disable sliding-window inference; run on the whole clip instead.",
    )
    args = parser.parse_args()

    weights = Path(args.weights)
    if not weights.exists() or weights.stat().st_size == 0:
        # fall back to the larger checkpoint that may be in src/
        alt = Path("src/best_videomae_shoplifting.pt")
        if alt.exists() and alt.stat().st_size > 0:
            weights = alt
        else:
            print(f"[kinetic] checkpoint not found at {args.weights}", file=sys.stderr)
            sys.exit(1)

    if args.video:
        video = Path(args.video)
        if not video.exists():
            print(f"[kinetic] video not found at {video}", file=sys.stderr)
            sys.exit(1)
        try:
            if args.no_segments:
                result = predict_one(weights, video)
            else:
                result = predict_segments(
                    weights,
                    video,
                    win_sec=args.win_sec,
                    stride_sec=args.stride_sec,
                )
        except Exception as e:
            sys.stdout.write(json.dumps({"error": str(e), "file": video.name}))
            sys.stdout.flush()
            sys.exit(2)
        sys.stdout.write(json.dumps(result))
        sys.stdout.flush()
        return

    run(weights, Path(args.videos), Path(args.out))


if __name__ == "__main__":
    main()
