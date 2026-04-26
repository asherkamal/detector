<img width="1917" height="946" alt="image" src="https://github.com/user-attachments/assets/e68f8fe3-a803-46da-a4f2-26150ac66d27" />

# Kinetic — Retail Theft Detection System

Kinetic is a web-based surveillance dashboard that uses a fine-tuned [VideoMAE](https://github.com/MCG-NJU/VideoMAE) model to automatically detect shoplifting and other theft-related behavior in retail security footage.

## What it does

Operators upload video clips through the web UI. Kinetic runs each clip through a sliding-window inference pipeline — chopping the video into 2-second segments, sampling 16 frames per segment, and passing each through VideoMAE to get a shoplifting probability. The highest probability across all segments becomes the headline confidence score. Clips that score ≥ 50% are flagged as **Abnormal**.

The dashboard also has a live camera grid intended to display real-time feeds from in-store cameras, an alert log that records flagged events, and a camera management page for enrolled devices.

## Stack

| Layer | Technology |
|---|---|
| Frontend / Backend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| ML inference | Python · HuggingFace Transformers · VideoMAE |
| Video decoding | `decord` (preferred) or OpenCV |
| Data storage | JSON flat files (`data/uploads.json`) |

## Project structure

```
app/
  (app)/
    dashboard/     — live camera grid + recent uploads
    uploads/       — upload & classify page
    alerts/        — alert log
    cameras/       — enrolled camera list
  api/upload/      — POST endpoint that receives video files
  actions/         — Next.js server actions (upload, finalize, delete)

components/        — UI components (live grid, upload dropzone, tiles, etc.)
lib/               — shared server utilities (uploads, cameras, alerts, auth)
scripts/
  infer.py         — VideoMAE inference script (segmented sliding-window)
data/
  uploads.json     — persisted upload records
public/uploads/    — uploaded video files served statically
models/            — fine-tuned checkpoint (best_videomae_shoplifting.pt)
```

## Inference pipeline

`scripts/infer.py` is called once per upload as a subprocess. It:

1. Reads video metadata (FPS, frame count) via OpenCV
2. Slides a **2-second window** across the clip with a **2-second stride**
3. Samples 16 frames evenly within each window
4. Runs a forward pass through `VideoMAEForVideoClassification` (fine-tuned, 2-class: `normal` / `shoplifting`)
5. Reports the max-pool probability across all windows as the headline score, plus the timestamps of the peak segment

The checkpoint is loaded from `models/best_videomae_shoplifting.pt`. If the file is missing, inference fails and the upload is marked with an error note.

Inference runs on CPU by default. A CUDA GPU will be used automatically if available.

## Getting started

**Prerequisites**

- Node.js 18+
- Python 3.9+ with `torch`, `transformers`, and either `decord` or `opencv-python` installed
- The fine-tuned checkpoint at `models/best_videomae_shoplifting.pt`

**Install and run**

```bash
npm install
npm run dev
```

By default the inference script is invoked as `python3`. Override this with the `KINETIC_PYTHON` environment variable if your Python binary has a different name:

```bash
KINETIC_PYTHON=python npm run dev
```

## Current status

- Live camera feeds are not yet connected — the grid shows placeholder tiles
- Alert log is empty pending real feed integration
- Upload & classify is fully functional end-to-end
