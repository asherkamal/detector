# Camera feeds

Drop nine clips here named `cam-01.mp4` through `cam-09.mp4` and the
dashboard will play them in the matching tile. Tiles fall back to a
synthetic "no signal" pattern if a file is missing — the demo still works
without any videos.

Quick way to populate from the DCSASS dataset (Kaggle public):

```bash
# pick any nine clips you like, then rename:
cp /path/to/dcsass/Shoplifting/Shoplifting001_x264.mp4  public/videos/cam-01.mp4
cp /path/to/dcsass/Shoplifting/Shoplifting014_x264.mp4  public/videos/cam-02.mp4
# ...etc
```

Then (optional) run real inference:

```bash
python scripts/infer.py \
  --weights models/best_videomae_shoplifting.pt \
  --videos public/videos \
  --out public/inference.json
```
