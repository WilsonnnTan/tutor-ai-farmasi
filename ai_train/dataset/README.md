# AI Training Dataset

This directory contains the datasets used for training the prediction models. 

> [!NOTE]
> Currently, the system only includes and uses the **Copper (Cu)** dataset. Support for other metals may be added in the future.

## Dataset Source
The full dataset can be downloaded from the following link:
[Google Drive - Cu Dataset](https://drive.google.com/drive/folders/1-6ry61ttHfE_TTVy6-1JpNOMFN_c97-u?usp=sharing)

## Directory Structure
- `cu_pict/`: Contains the raw `.jpg` images of copper samples.
- `.gitignore`: Configured to ignore large binary files.

## Image Naming Convention (Cu)
The images follow a specific naming pattern to encode the concentration data:
`[concentration][variant] ([replicate]).jpg`

**Fields:**
- **Concentration**: The Cu concentration value (e.g., `0`, `0,1`, `0,5`, `1,2`, `2`, `2,5`). Note that commas are used as decimal separators in some filenames.
- **Variant**: A letter (a-i) indicating different samples or batches prepared at that concentration.
- **Replicate**: A number (1-5) indicating multiple photos taken of the same sample variant.

**Example:**
`0,5b (3).jpg` → Concentration: 0.5, Variant: b, Replicate: 3.

## Usage in Training
The training pipeline (located in `../`) parses these filenames to:
1. Extract the ground truth concentration (Y).
2. Process the image to extract RGB features (X) from the center crop of the bottle glasses.
3. Train a regression model (e.g., Random Forest) to predict concentration from image data.