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

# CROP SETTINGS (Matching training notebooks)
CROP_BOX_WIDTH = 100
CROP_BOX_HEIGHT = 100
CROP_OFFSET_X = 65
CROP_OFFSET_Y = 750

# BASE CLASS
class BaseMetalPredictor(ABC):
    def __init__(self, model_name: str, threshold: float):
        self.model_path = os.path.join(MODEL_DIR, model_name)
        self.threshold = threshold
        self.model = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            artifact = joblib.load(self.model_path)
            if isinstance(artifact, dict) and "pipeline" in artifact:
                return artifact["pipeline"]
            return artifact
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
        prediction = self.model.predict(X)[0]
        return float(prediction)

    def get_status(self, prediction: float) -> str:
        """Evaluate status against threshold."""
        return "AMAN" if prediction <= self.threshold else "TIDAK AMAN"

# CONCRETE IMPLEMENTATION: COPPER (CU)
class CopperPredictor(BaseMetalPredictor):
    def __init__(self):
        # cu_model.pkl, threshold 2.0
        super().__init__("model_cu.pkl", 2.0)

    def extract_features(self, rgb: list) -> dict:
        r, g, b = rgb
        
        # Calculate HSV from mean RGB (normalize to 0-1 scale for colorsys)
        h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
        
        # Match original model_cu.pkl feature set exactly
        return {
            "h": h,
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
def extract_rgb_bytes(file_bytes: bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    w, h = img.size
    
    # Calculate crop coordinates exactly as in training
    left = max((w - CROP_BOX_WIDTH) // 2 + CROP_OFFSET_X, 0)
    top = max((h - CROP_BOX_HEIGHT) // 2 + CROP_OFFSET_Y, 0)
    right = min(left + CROP_BOX_WIDTH, w)
    bottom = min(top + CROP_BOX_HEIGHT, h)

    crop = img.crop((left, top, right, bottom))
    arr = np.array(crop, dtype=np.float64)
    
    # Mean RGB values
    mean_r = arr[:, :, 0].mean()
    mean_g = arr[:, :, 1].mean()
    mean_b = arr[:, :, 2].mean()
    
    return [float(mean_r), float(mean_g), float(mean_b)]

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
