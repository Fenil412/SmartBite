from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from io import StringIO
import logging
import re

rule_filtering_bp = Blueprint("rule_filtering", __name__)

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

# Combine text features
df['combined_text'] = (
    df['Breakfast Suggestion'].fillna('') + ' ' +
    df['Lunch Suggestion'].fillna('') + ' ' +
    df['Dinner Suggestion'].fillna('') + ' ' +
    df['Snack Suggestion'].fillna('')
)

# Numerical features
num_cols = ['Ages', 'Height', 'Weight', 'Protein', 'Sugar', 'Sodium', 'Calories', 'Carbohydrates', 'Fiber', 'Fat']

df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
logger.debug("Filled missing numerical values with column means")

# Fit scaler
X_num = df[num_cols].values
scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_num)

# Fit TF-IDF
tfidf = TfidfVectorizer(stop_words='english')
X_text = tfidf.fit_transform(df['combined_text'])
logger.debug("TF-IDF vectorization completed")

# Combined features
X = np.hstack((X_text.toarray(), X_num_scaled))

# Step 2: Train ML model for special meal types (e.g., keto/low-carb classification based on macros)
macro_cols = ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fiber', 'Sugar', 'Sodium']
X_macro = df[macro_cols]

# Label 'is_low_carb' for keto demonstration (threshold based on analysis; adjust as needed)
df['is_low_carb'] = (df['Carbohydrates'] < 200).astype(int)  # Some rows qualify; e.g., 180, 150, etc.
logger.debug(f"Number of low-carb meals labeled: {df['is_low_carb'].sum()}")

# Train Random Forest Classifier
clf = RandomForestClassifier(random_state=42)
clf.fit(X_macro, df['is_low_carb'])
logger.debug("Trained Random Forest Classifier for low-carb/keto prediction")

# Define excluded words for rule-based filtering (Step 1)
excluded_words = {
    'Vegan': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish', 'egg', 'yogurt', 'cheese', 'honey'],
    'Vegetarian': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish'],
    'Omnivore': []
}

@rule_filtering_bp.route('/recommend', methods=['POST'])
def recommend():
    logger.debug("Received request to /recommend")
    data = request.json

    required_fields = ['dietary_preference', 'activity_level', 'age', 'height', 'weight',
                       'target_protein', 'target_sugar', 'target_sodium', 'target_calories',
                       'target_carbs', 'target_fiber', 'target_fat']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        logger.error(f"Missing fields: {missing_fields}")
        return jsonify({'error': f'Missing fields: {missing_fields}'}), 400

    try:
        dietary_preference = data['dietary_preference']
        activity_level = data['activity_level']
        age = float(data['age'])
        height = float(data['height'])
        weight = float(data['weight'])
        target_protein = float(data['target_protein'])
        target_sugar = float(data['target_sugar'])
        target_sodium = float(data['target_sodium'])
        target_calories = float(data['target_calories'])
        target_carbs = float(data['target_carbs'])
        target_fiber = float(data['target_fiber'])
        target_fat = float(data['target_fat'])
        preferred_ingredients = data.get('preferred_ingredients', '')
        disease = data.get('disease', '')
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input format: {str(e)}")
        return jsonify({'error': 'Invalid input format. Ensure numerical fields are numbers.'}), 400

    logger.debug(f"Input: dietary_preference={dietary_preference}, activity_level={activity_level}, "
                 f"disease={disease}, ingredients={preferred_ingredients}")

    # Step 1: Rule-Based Filtering
    # Filter by activity level and dietary preference (if standard)
    if dietary_preference.lower() in [pref.lower() for pref in df['Dietary Preference'].unique()]:
        filtered = df[
            (df['Dietary Preference'].str.lower() == dietary_preference.lower()) &
            (df['Activity Level'].str.lower() == activity_level.lower())
        ]
    else:
        # For non-standard (e.g., keto), filter by activity only initially
        filtered = df[df['Activity Level'].str.lower() == activity_level.lower()]

    # Apply disease filter
    if disease:
        filtered = filtered[filtered['Disease'].str.contains(disease, case=False, na=False)]

    # Apply keyword exclusion rules if applicable
    pref_key = dietary_preference.capitalize()  # e.g., 'Vegan'
    if pref_key in excluded_words:
        excluded = excluded_words[pref_key]
        if excluded:
            pattern = r'\b(?:' + '|'.join(re.escape(word) for word in excluded) + r')\b'
            mask = ~filtered['combined_text'].str.lower().str.contains(pattern, na=False)
            filtered = filtered[mask]
            logger.debug(f"Applied keyword exclusion for {dietary_preference}; remaining: {len(filtered)}")

    # Handle special preferences like keto using ML (Step 2)
    if 'keto' in dietary_preference.lower():
        if not filtered.empty:
            pred = clf.predict(filtered[macro_cols])
            filtered = filtered[pred == 1]
            logger.debug(f"Applied ML filter for keto/low-carb; remaining: {len(filtered)}")
        else:
            logger.warning("No rows available for keto filtering; skipping ML step")


    filtered_idx = filtered.index
    logger.debug(f"Found {len(filtered_idx)} matching meal plans after filtering")

    # Fallback if no matches
    if len(filtered_idx) == 0:
        logger.warning("No exact matches found, relaxing filters")
        filtered = df[df['Dietary Preference'].str.lower().str.contains('omni|veg', na=False)]  # Broader
        filtered_idx = filtered.index

    # Create user vectors
    user_num = np.array([[age, height, weight, target_protein, target_sugar, target_sodium,
                          target_calories, target_carbs, target_fiber, target_fat]])
    user_num_scaled = scaler.transform(user_num)
    user_text_vec = tfidf.transform([preferred_ingredients])
    user_vec = np.hstack((user_text_vec.toarray(), user_num_scaled))

    # Step 3: ML Ranking - Compute cosine similarities and rank
    X_filtered = X[filtered_idx]
    similarities = cosine_similarity(user_vec, X_filtered)[0]
    logger.debug(f"Computed similarities: {similarities[:5]}...")

    # Sort by similarity descending and get top 1 (or top k if desired)
    sorted_indices = np.argsort(similarities)[::-1]
    best_filtered_idx = sorted_indices[0]
    best_global_idx = filtered_idx[best_filtered_idx]

    recommendation = df.iloc[best_global_idx].to_dict()
    logger.debug("Recommendation generated successfully")

    return jsonify({'recommendation': recommendation})

@rule_filtering_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200
