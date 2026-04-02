import os
import re
import numpy as np
import pandas as pd
from PIL import Image

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def parse_concentration_from_filename(filename: str) -> float | None:
    """
    Parse the concentration value from the filename.

    Naming convention examples from `cu pict`:
      - "0,1a (1).jpg"  → concentration 0.1
      - "0,5b_(3).jpg"  → concentration 0.5
      - "0a (1).jpg"    → concentration 0
      - "1,2d_(4).jpg"  → concentration 1.2
      - "2,5A(2).jpg"   → concentration 2.5
      - "B0,1(1).jpg"   → concentration 0.1
      - "B2,5(3).jpg"   → concentration 2.5
      - "0A(1).jpg"     → concentration 0
      - "0C(5).jpg"     → concentration 0
      - "1A(3).jpg"     → concentration 1
      - "1C(5).jpg"     → concentration 1
      - "1,5 b(3).jpg"  → concentration 1.5

    Strategy:
      1. Remove the file extension
      2. Try multiple regex patterns to extract the numeric part
    """
    name = os.path.splitext(filename)[0]

    # Pattern for filenames starting with "B" prefix (e.g., "B0,1(1)", "B2,5(3)")
    m = re.match(r'^[Bb](\d+[,.]?\d*)', name)
    if m:
        return float(m.group(1).replace(',', '.'))

    # Pattern for standard naming: number at start, possibly with comma decimal
    # Matches: "0,1a (1)", "0,5b_(3)", "2,5A(2)", "1,5 b(3)", "0a (1)", "1a_(2)"
    # Also matches: "0A(1)", "1C(5)", "0,1A(1)", "0,8C(3)"
    m = re.match(r'^(\d+[,.]?\d*)', name)
    if m:
        return float(m.group(1).replace(',', '.'))

    return None


def extract_center_crop_rgb(image_path: str, box_w: int, box_h: int, offset_x: int, offset_y: int) -> tuple[float, float, float]:
    """
    Open the image, crop the center region (box_w x box_h),
    and return the mean R, G, B values of that cropped region.
    """
    img = Image.open(image_path).convert("RGB")
    w, h = img.size

    # Calculate crop coordinates (center crop)
    left = max((w - box_w) // 2 + offset_x, 0)
    top = max((h - box_h) // 2 + offset_y, 0)
    right = min(left + box_w, w)
    bottom = min(top + box_h, h)

    cropped = img.crop((left, top, right, bottom))
    arr = np.array(cropped, dtype=np.float64)

    # Mean of all pixels in the crop region
    mean_r = arr[:, :, 0].mean()
    mean_g = arr[:, :, 1].mean()
    mean_b = arr[:, :, 2].mean()

    return mean_r, mean_g, mean_b
  

def build_dataset(image_folder: str, output_csv: str, box_w: int, box_h: int, offset_x: int, offset_y: int):
    """
    Walk through all images in image_folder, extract center-crop RGB,
    parse concentration from filename, and write to CSV.

    CSV columns: filename, mean_R, mean_G, mean_B, concentration
    """
    rows = []
    skipped = []

    image_files = sorted([
        f for f in os.listdir(image_folder)
        if os.path.splitext(f)[1].lower() in SUPPORTED_EXTENSIONS
    ])

    print(f"\nFound {len(image_files)} image files in '{image_folder}'")

    for i, fname in enumerate(image_files):
        conc = parse_concentration_from_filename(fname)
        if conc is None:
            skipped.append(fname)
            continue

        fpath = os.path.join(image_folder, fname)
        try:
            mean_r, mean_g, mean_b = extract_center_crop_rgb(fpath, box_w, box_h, offset_x, offset_y)
        except Exception as e:
            print(f"  Error processing '{fname}': {e}")
            skipped.append(fname)
            continue

        rows.append({
            "filename": fname,
            "mean_R": round(mean_r, 3),
            "mean_G": round(mean_g, 3),
            "mean_B": round(mean_b, 3),
            "concentration": conc,
        })

        # Progress indicator (every 50 images)
        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(image_files)} images...")

    print(f"\nSuccessfully processed {len(rows)} images.")
    if skipped:
        print(f"Skipped {len(skipped)} files (could not parse concentration): {skipped[:5]}{'...' if len(skipped) > 5 else ''}")

    # Write CSV
    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False)
    print(f"Dataset saved to: {output_csv}")
    print(f"   Shape: {df.shape}")
    print(f"\nConcentration distribution:")
    print(df["concentration"].value_counts().sort_index())

    return df