import pandas as pd
import joblib
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor

df = pd.read_csv("datasets/detailed_meals_macros_CLEANED.csv")

X = df[[
    "Ages", "Height", "Weight",
    "Activity Level", "Dietary Preference"
]]

y = df[[
    "Breakfast Calories",
    "Lunch Calories",
    "Dinner Calories",
    "Snacks Calories"
]]

X = pd.get_dummies(df[[
    "Ages", "Height", "Weight",
    "Activity Level", "Dietary Preference"
]])

model = MultiOutputRegressor(
    XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8
    )
)

model.fit(X, y)

joblib.dump(model, "models/meal_distribution_model.pkl")
print("✅ Model trained & saved")
