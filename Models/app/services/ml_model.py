try:
    import joblib
    import pandas as pd
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False
    print("Warning: joblib not available. ML model functionality disabled.")

# ✅ LAZY LOADING - No model loaded at startup (prevents OOM)
MODEL_PATH = "models/meal_distribution_model.pkl"
model = None

def get_model():
    """
    Lazy load ML model only when needed (prevents startup OOM)
    """
    global model
    if not JOBLIB_AVAILABLE:
        return None
    
    if model is None:
        try:
            model = joblib.load(MODEL_PATH)
            print("ML model loaded successfully")
        except FileNotFoundError:
            print("Warning: ML model file not found")
            return None
        except Exception as e:
            print(f"Error loading ML model: {e}")
            return None
    
    return model

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
    if not JOBLIB_AVAILABLE:
        return None

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
    """
    Predict meal distribution using lazy-loaded ML model
    """
    # ✅ Lazy load model only when API endpoint is called
    current_model = get_model()
    
    if not JOBLIB_AVAILABLE or current_model is None:
        # Return default distribution when ML model is not available
        return {
            "breakfast": 25.0,
            "lunch": 35.0,
            "dinner": 30.0,
            "snacks": 10.0,
            "error": "ML model not available, using default distribution"
        }
    
    df = encode_profile(profile)
    if df is None:
        return {
            "breakfast": 25.0,
            "lunch": 35.0,
            "dinner": 30.0,
            "snacks": 10.0,
            "error": "Profile encoding failed, using default distribution"
        }

    try:
        # 🔹 Align columns with training model
        for col in current_model.feature_names_in_:
            if col not in df.columns:
                df[col] = 0

        df = df[current_model.feature_names_in_]
        preds = current_model.predict(df)[0]

        return {
            "breakfast": round(preds[0], 1),
            "lunch": round(preds[1], 1),
            "dinner": round(preds[2], 1),
            "snacks": round(preds[3], 1)
        }
    except Exception as e:
        print(f"ML prediction error: {e}")
        return {
            "breakfast": 25.0,
            "lunch": 35.0,
            "dinner": 30.0,
            "snacks": 10.0,
            "error": f"ML prediction failed: {str(e)}, using default distribution"
        }