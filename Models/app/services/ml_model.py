try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    # Create a minimal pandas-like DataFrame class for fallback
    class MockDataFrame:
        def __init__(self, data):
            self.data = data
        def get_dummies(self, *args, **kwargs):
            return self
        def __getitem__(self, key):
            return self
        def to_dict(self):
            return self.data
    pd = type('MockPandas', (), {'DataFrame': MockDataFrame})()

import os

MODEL_PATH = "models/meal_distribution_model.pkl"

# Lazy loading to prevent memory issues during startup
_model = None

def get_model():
    global _model
    if not JOBLIB_AVAILABLE:
        return None
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            # Return None if file doesn't exist (for deployment)
            _model = None
    return _model


# ✅ Must match training-time vocab
DISEASES = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Kidney Disease",
    "Weight Gain"
]

GOALS = [
    "Fat Loss",
    "Muscle Gain",
    "Muscle Retention",
    "Weight Loss",
    "Weight Gain"
]

ALLERGIES = [
    "peanuts",
    "gluten",
    "dairy",
    "soy",
    "shellfish"
]


def encode_profile(profile: dict) -> pd.DataFrame:
    """
    Converts user profile into model-ready numeric dataframe
    """

    base = {
        "Ages": profile["age"],
        "Height": profile["height"],
        "Weight": profile["weight"],
        "Activity Level": profile["activityLevel"],
        "Dietary Preference": profile["dietaryPreference"]
    }

    # 🔹 Disease multi-hot
    for d in DISEASES:
        base[f"disease_{d}"] = int(d in profile.get("diseases", []))

    # 🔹 Goal multi-hot
    for g in GOALS:
        base[f"goal_{g}"] = int(g in profile.get("goals", []))

    # 🔹 Allergy multi-hot (🔥 FIX)
    for a in ALLERGIES:
        base[f"allergy_{a}"] = int(a in profile.get("allergies", []))

    df = pd.DataFrame([base])

    # Only encode categorical STRING columns
    df = pd.get_dummies(
        df,
        columns=["Activity Level", "Dietary Preference"],
        dtype=int
    )

    return df


def predict_distribution(profile: dict) -> dict:
    model = get_model()
    
    # Return default distribution if model is not available
    if model is None:
        return {
            "breakfast": 25.0,
            "lunch": 30.0,
            "dinner": 35.0,
            "snacks": 10.0
        }
    
    df = encode_profile(profile)

    # 🔹 Align columns with training model
    for col in model.feature_names_in_:
        if col not in df.columns:
            df[col] = 0

    df = df[model.feature_names_in_]

    preds = model.predict(df)[0]

    return {
        "breakfast": round(preds[0], 1),
        "lunch": round(preds[1], 1),
        "dinner": round(preds[2], 1),
        "snacks": round(preds[3], 1)
    }
