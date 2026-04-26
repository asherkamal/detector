import kagglehub
import shutil
import os

# Download the dataset
print("Downloading DCSASS dataset from Kaggle...")
dataset_path = kagglehub.dataset_download("mateohervas/dcsass-dataset")

# Path to your Next.js public dataset directory
target_dir = "public/dataset"
os.makedirs(target_dir, exist_ok=True)

# Copy all video files to public/dataset
for fname in os.listdir(dataset_path):
    if fname.endswith(".mp4"):
        shutil.copy(os.path.join(dataset_path, fname), os.path.join(target_dir, fname))
print("Videos copied to public/dataset/")
