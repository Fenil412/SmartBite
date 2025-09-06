from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from io import StringIO
import pulp
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import logging
import re

nutrition_goal_bp = Blueprint("nutrition_goal", __name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    # Load the data
    df = pd.read_csv('detailed_meals_macros_CLEANED.csv')
except FileNotFoundError:
    logger.error("CSV file 'detailed_meals_macros_CLEANED.csv' not found")
    raise

logger.debug(f"Loaded {len(df)} rows from CSV")

# Clean numeric columns
numeric_cols = ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Sugar', 'Sodium', 'Fiber']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')
df = df.dropna(subset=numeric_cols)
logger.debug("Cleaned numeric columns")

# Add random cost
np.random.seed(42)
df['cost'] = np.random.uniform(5, 15, len(df))
logger.debug(f"Added random costs: {df['cost'].describe().to_dict()}")

# Step 1: Train Random Forest Regressors for Nutrition Prediction
# Features: Ages, Height, Weight, Activity Level, Dietary Preference
# Targets: Calories, Protein, Carbohydrates, Fat
features = ['Ages', 'Height', 'Weight', 'Activity Level', 'Dietary Preference']
targets = ['Calories', 'Protein', 'Carbohydrates', 'Fat']

# Encode categorical features
le_activity = LabelEncoder()
le_dietary = LabelEncoder()
df['Activity Level Encoded'] = le_activity.fit_transform(df['Activity Level'])
df['Dietary Preference Encoded'] = le_dietary.fit_transform(df['Dietary Preference'])

# Prepare training data
X_train = df[['Ages', 'Height', 'Weight', 'Activity Level Encoded', 'Dietary Preference Encoded']]
y_train = df[targets]

# Train Random Forest Regressors
rf_models = {}
for target in targets:
    rf = RandomForestRegressor(random_state=42)
    rf.fit(X_train, y_train[target])
    rf_models[target] = rf
logger.debug("Trained Random Forest Regressors for nutrition prediction")

# Define excluded words for rule-based filtering
excluded_words = {
    'Vegan': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish', 'egg', 'yogurt', 'cheese', 'honey'],
    'Vegetarian': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish'],
    'Omnivore': []
}

def safe_float(value, default=0.0):
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


@nutrition_goal_bp.route('/recommend', methods=['POST'])
def recommend():
    logger.debug("Received request to /recommend")
    data = request.json

    # Required inputs (nutrition targets are optional)
    required_fields = ['dietary_preference', 'activity_level', 'age', 'height', 'weight']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        logger.error(f"Missing fields: {missing_fields}")
        return jsonify({'error': f'Missing fields: {missing_fields}'}), 400

    # Extract safe string fields first
    dietary_preference = data.get('dietary_preference', '')
    activity_level = data.get('activity_level', '')
    disease = data.get('disease', '')

    try:
        age = float(data.get('age', 0))
        height = float(data.get('height', 0))
        weight = float(data.get('weight', 0))
        days = int(data.get('days', 7))
        # Optional nutrition targets
        target_calories = float(data.get('target_calories', 0))
        target_protein = float(data.get('target_protein', 0))
        target_carbs = float(data.get('target_carbs', 0))
        target_fat = float(data.get('target_fat', 0))
        target_sugar = float(data.get('target_sugar', 150))
        target_sodium = float(data.get('target_sodium', 25))
        target_fiber = float(data.get('target_fiber', 25))
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input format: {str(e)}")
        return jsonify({'error': 'Invalid input format. Ensure numerical fields are numbers.'}), 400

    logger.debug(f"Input: dietary_preference={dietary_preference}, activity_level={activity_level}, "f"disease={disease}, days={days}")


    # Step 2: Predict Nutrition Goals (if not provided)
    if target_calories == 0 or target_protein == 0 or target_carbs == 0 or target_fat == 0:
        try:
            activity_encoded = le_activity.transform([activity_level])[0]
            dietary_encoded = le_dietary.transform([dietary_preference])[0]
        except ValueError:
            logger.error("Invalid activity_level or dietary_preference")
            return jsonify({'error': 'Invalid activity_level or dietary_preference'}), 400

        user_features = np.array([[age, height, weight, activity_encoded, dietary_encoded]])
        predictions = {target: rf_models[target].predict(user_features)[0] for target in targets}
        logger.debug(f"Predicted nutrition goals: {predictions}")

        # Use predicted values if not provided
        target_calories = target_calories if target_calories > 0 else predictions['Calories']
        target_protein = target_protein if target_protein > 0 else predictions['Protein']
        target_carbs = target_carbs if target_carbs > 0 else predictions['Carbohydrates']
        target_fat = target_fat if target_fat > 0 else predictions['Fat']
    else:
        predictions = None

    # Step 3: Rule-Based Filtering
    filtered = df[
        (df['Dietary Preference'].str.lower() == dietary_preference.lower()) &
        (df['Activity Level'].str.lower() == activity_level.lower())
    ]

    # Combine text for filtering
    filtered['combined_text'] = (
        filtered['Breakfast Suggestion'].fillna('') + ' ' +
        filtered['Lunch Suggestion'].fillna('') + ' ' +
        filtered['Dinner Suggestion'].fillna('') + ' ' +
        filtered['Snack Suggestion'].fillna('')
    )

    # Apply disease filter
    if disease:
        filtered = filtered[filtered['Disease'].str.contains(disease, case=False, na=False)]

    # Apply keyword exclusion
    pref_key = dietary_preference.capitalize()
    if pref_key in excluded_words:
        excluded = excluded_words[pref_key]
        if excluded:
            pattern = r'\b(?:' + '|'.join(re.escape(word) for word in excluded) + r')\b'
            mask = ~filtered['combined_text'].str.lower().str.contains(pattern, na=False)
            filtered = filtered[mask]
            logger.debug(f"Applied keyword exclusion for {dietary_preference}; remaining: {len(filtered)}")

    # Apply keto filter if specified
    if 'keto' in dietary_preference.lower():
        filtered = filtered[filtered['Carbohydrates'] < 200]
        logger.debug(f"Applied keto filter; remaining: {len(filtered)}")

    filtered_idx = filtered.index
    logger.debug(f"Found {len(filtered_idx)} matching meal plans after filtering")

    if len(filtered_idx) == 0:
        logger.warning("No matches found, relaxing to dietary preference only")
        filtered = df[df['Dietary Preference'].str.lower() == dietary_preference.lower()]
        filtered_idx = filtered.index
        if len(filtered_idx) == 0:
            logger.warning("No matches for dietary preference, using full dataset")
            filtered = df
            filtered_idx = df.index

    # Step 4: Linear Programming Optimization
    prob = pulp.LpProblem("MealPlanning", pulp.LpMaximize)
    x = pulp.LpVariable.dicts("select", filtered_idx, lowBound=0, cat='Integer')
    y = pulp.LpVariable.dicts("used", filtered_idx, cat='Binary')

    # Objective: Maximize variety - 0.01 * cost
    prob += pulp.lpSum([y[i] for i in filtered_idx]) - 0.01 * pulp.lpSum([x[i] * filtered.loc[i, 'cost'] for i in filtered_idx])

    # Constraint: Total days
    prob += pulp.lpSum([x[i] for i in filtered_idx]) == days

    # Link y_i to x_i
    for i in filtered_idx:
        prob += y[i] <= x[i]
        prob += y[i] >= x[i] / 100

    # Nutrition constraints (weekly, ±10% flexibility)
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Calories'] for i in filtered_idx]) >= target_calories * days * 0.9
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Calories'] for i in filtered_idx]) <= target_calories * days * 1.1
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Protein'] for i in filtered_idx]) >= target_protein * days * 0.9
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Carbohydrates'] for i in filtered_idx]) >= target_carbs * days * 0.9
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Fat'] for i in filtered_idx]) >= target_fat * days * 0.9
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Sugar'] for i in filtered_idx]) <= target_sugar * days * 1.1
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Sodium'] for i in filtered_idx]) <= target_sodium * days * 1.1
    prob += pulp.lpSum([x[i] * filtered.loc[i, 'Fiber'] for i in filtered_idx]) >= target_fiber * days * 0.9

    # Solve
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0))
    logger.debug(f"LP solver status: {pulp.LpStatus[status]}")

    if status != 1:
        logger.error("LP optimization failed")
        return jsonify({'error': 'Optimization failed. Try relaxing constraints or filters.'}), 500

    # Step 5: Collect Results
    weekly_plan = []
    total_cost = 0
    for i in filtered_idx:
        count = int(x[i].varValue)
        if count > 0:
            total_cost += count * filtered.loc[i, 'cost']
            meal = filtered.loc[i].to_dict()
            for day in range(1, count + 1):
                weekly_plan.append({
                    'day': len(weekly_plan) + 1,
                    'meal': meal
                })

    weekly_totals = {
        'Calories': sum(m['meal']['Calories'] for m in weekly_plan),
        'Protein': sum(m['meal']['Protein'] for m in weekly_plan),
        'Carbohydrates': sum(m['meal']['Carbohydrates'] for m in weekly_plan),
        'Fat': sum(m['meal']['Fat'] for m in weekly_plan),
        'Sugar': sum(m['meal']['Sugar'] for m in weekly_plan),
        'Sodium': sum(m['meal']['Sodium'] for m in weekly_plan),
        'Fiber': sum(m['meal']['Fiber'] for m in weekly_plan),
        'Cost': total_cost
    }
    logger.debug(f"Weekly totals: {weekly_totals}")

    response = {'weekly_plan': weekly_plan, 'weekly_totals': weekly_totals}
    if predictions:
        response['predicted_nutrition'] = predictions

    return jsonify(response)

@nutrition_goal_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200
