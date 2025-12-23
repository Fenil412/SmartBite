import os
import joblib
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "ranking_model.pkl")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError("❌ ranking_model.pkl not found. Train model first.")

model = joblib.load(MODEL_PATH)

def rank_meals(meals: list):
    X = [
        [
            meal["nutrition"]["calories"],
            meal["nutrition"]["protein"],
            meal["nutrition"]["carbs"],
            meal["nutrition"]["fats"],
        ]
        for meal in meals
    ]

    scores = model.predict(np.array(X))
    ranked = sorted(zip(meals, scores), key=lambda x: x[1], reverse=True)
    return [m for m, _ in ranked]
