import os
import io
import joblib
import colorsys
import numpy as np
import pandas as pd
from PIL import Image
from abc import ABC, abstractmethod

# CONFIG
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODEL_DIR = os.path.join(PROJECT_ROOT, "models")

# BASE CLASS
class BaseMetalPredictor(ABC):
    def __init__(self, model_name: str, threshold: float):
        self.model_path = os.path.join(MODEL_DIR, model_name)
        self.threshold = threshold
        self.model = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            return joblib.load(self.model_path)
        return None

    @abstractmethod
    def extract_features(self, rgb: list) -> dict:
        """Logic for feature extraction from RGB."""
        pass

    def predict(self, features: dict) -> float:
        """Make a prediction with the loaded model."""
        if self.model is None:
            raise ValueError(f"Model at {self.model_path} not found!")
        X = pd.DataFrame([features])
        return float(self.model.predict(X)[0])

    def get_status(self, prediction: float) -> str:
        """Evaluate status against threshold."""
        return "AMAN" if prediction <= self.threshold else "TIDAK AMAN"

# CONCRETE IMPLEMENTATION: COPPER (CU)
class CopperPredictor(BaseMetalPredictor):
    def __init__(self):
        # model_cu.pkl, threshold 2.0
        super().__init__("model_cu.pkl", 2.0)

    def extract_features(self, rgb: list) -> dict:
        r, g, b = rgb
        # Standard RGB to HSV scaled conversion
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        return {
            "h": h * 360,
            "s": s,
            "v": v,
            "mean_r": r,
            "mean_g": g,
            "mean_b": b
        }

# REGISTRY
class PredictorRegistry:
    def __init__(self):
        self._predictors = {}
        self._aliases = {}

    def register(self, metal_id: str, predictor_class, aliases: list = None):
        instance = predictor_class()
        self._predictors[metal_id.lower()] = instance
        if aliases:
            for alias in aliases:
                self._aliases[alias.lower()] = metal_id.lower()

    def get_predictor(self, metal_name: str) -> BaseMetalPredictor:
        name = metal_name.lower()
        metal_id = self._aliases.get(name, name)
        return self._predictors.get(metal_id)

    def get_supported_metals(self) -> list:
        return list(self._predictors.keys())

# INITIALIZE REGISTRY
registry = PredictorRegistry()
registry.register("cu", CopperPredictor, aliases=["tembaga", "copper"])

# HELPER: SHARED IMAGE PROCESSING
def extract_rgb_bytes(file_bytes: bytes, sample_size: int = 50):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    w, h = img.size
    cx, cy = w // 2, int(h * 0.75)
    half = sample_size // 2

    crop = img.crop((
        max(0, cx - half),
        max(0, cy - half),
        min(w, cx + half),
        min(h, cy + half)
    ))

    arr = np.array(crop)
    mean_rgb = arr.reshape(-1, 3).mean(axis=0)
    return [int(mean_rgb[0]), int(mean_rgb[1]), int(mean_rgb[2])]

# MAIN PREDICT FUNCTION
def predict_concentration(image_bytes: bytes, test_type: str):
    predictor = registry.get_predictor(test_type)
    if not predictor:
        supported = ", ".join(registry.get_supported_metals())
        raise ValueError(f"Metode '{test_type}' tidak didukung. Tersedia: {supported}")

    rgb = extract_rgb_bytes(image_bytes)
    features = predictor.extract_features(rgb)
    prediction = predictor.predict(features)

    return {
        "rgb": rgb,
        "concentration": round(prediction, 4),
        "status": predictor.get_status(prediction)
    }
