from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import pulp
import logging
import re

meal_planning_bp = Blueprint("meal_planning", __name__)

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

# Add random cost (since cost data isn't provided)
np.random.seed(42)
df['cost'] = np.random.uniform(5, 15, len(df))
logger.debug(f"Added random costs: {df['cost'].describe().to_dict()}")

# Define excluded words for rule-based filtering
excluded_words = {
    'Vegan': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish', 'egg', 'yogurt', 'cheese', 'honey'],
    'Vegetarian': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish'],
    'Omnivore': []
}

@meal_planning_bp.route('/recommend', methods=['POST'])
def recommend():
    logger.debug("Received request to /recommend")
    data = request.json

    # Required inputs
    required_fields = ['dietary_preference', 'activity_level', 'target_calories',
                      'target_protein', 'target_carbs', 'target_fat', 'target_sugar',
                      'target_sodium', 'target_fiber']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        logger.error(f"Missing fields: {missing_fields}")
        return jsonify({'error': f'Missing fields: {missing_fields}'}), 400

    try:
        dietary_preference = data['dietary_preference']
        activity_level = data['activity_level']
        target_calories = float(data['target_calories'])
        target_protein = float(data['target_protein'])
        target_carbs = float(data['target_carbs'])
        target_fat = float(data['target_fat'])
        target_sugar = float(data['target_sugar'])
        target_sodium = float(data['target_sodium'])
        target_fiber = float(data['target_fiber'])
        disease = data.get('disease', '')
        days = int(data.get('days', 7))  # Default to 7 days
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input format: {str(e)}")
        return jsonify({'error': 'Invalid input format. Ensure numerical fields are numbers.'}), 400

    logger.debug(f"Input: dietary_preference={dietary_preference}, activity_level={activity_level}, "
                 f"disease={disease}, days={days}")

    # Step 1: Rule-Based Filtering
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

    # Step 2: Linear Programming for Optimization
    prob = pulp.LpProblem("MealPlanning", pulp.LpMaximize)
    x = pulp.LpVariable.dicts("select", filtered_idx, lowBound=0, cat='Integer')
    y = pulp.LpVariable.dicts("used", filtered_idx, cat='Binary')

    # Objective: Maximize variety (distinct plans) - 0.01 * cost
    prob += pulp.lpSum([y[i] for i in filtered_idx]) - 0.01 * pulp.lpSum([x[i] * filtered.loc[i, 'cost'] for i in filtered_idx])

    # Constraint: Total days
    prob += pulp.lpSum([x[i] for i in filtered_idx]) == days

    # Link y_i to x_i
    for i in filtered_idx:
        prob += y[i] <= x[i]
        prob += y[i] >= x[i] / 100  # Large M approximation for x_i > 0

        # Nutrition constraints (weekly, scaled from daily targets with wider tolerance)
        calorie_margin = 0.2   # 20% instead of 10%
        macro_margin   = 0.2   # 20% margin for macros
        limit_margin   = 1.3   # 30% higher cap for sugar/sodium

        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Calories'] for i in filtered_idx]) >= target_calories * days * (1 - calorie_margin)
        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Calories'] for i in filtered_idx]) <= target_calories * days * (1 + calorie_margin) 

        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Protein'] for i in filtered_idx]) >= target_protein * days * (1 - macro_margin)
        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Carbohydrates'] for i in filtered_idx]) >= target_carbs * days * (1 - macro_margin)
        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Fat'] for i in filtered_idx]) >= target_fat * days * (1 - macro_margin)

        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Sugar'] for i in filtered_idx]) <= target_sugar * days * limit_margin   
        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Sodium'] for i in filtered_idx]) <= target_sodium * days * limit_margin
        prob += pulp.lpSum([x[i] * filtered.loc[i, 'Fiber'] for i in filtered_idx]) >= target_fiber * days * (1 - macro_margin)


    # Solve
    status = prob.solve(pulp.PULP_CBC_CMD(msg=0))
    logger.debug(f"LP solver status: {pulp.LpStatus[status]}")

    if status != 1:
        logger.error("LP optimization failed")
        return jsonify({'error': 'Optimization failed. Try relaxing constraints or filters.'}), 500

    # Step 3: Collect Results
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

    # Log weekly totals
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

    return jsonify({'weekly_plan': weekly_plan, 'weekly_totals': weekly_totals})


@meal_planning_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200