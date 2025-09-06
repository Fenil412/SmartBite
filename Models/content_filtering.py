from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import logging

content_filtering_bp = Blueprint("content_filtering", __name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    # Load the data
    df = pd.read_csv('detailed_meals_macros_CLEANED.csv')
except FileNotFoundError:
    logger.error("CSV file 'detailed_meals_macros_CLEANED.csv' not found")
    raise

# Log data loading
logger.debug(f"Loaded {len(df)} rows from CSV")

# Combine text features: suggestions for breakfast, lunch, dinner, snack
df['combined_text'] = (
    df['Breakfast Suggestion'].fillna('') + ' ' +
    df['Lunch Suggestion'].fillna('') + ' ' +
    df['Dinner Suggestion'].fillna('') + ' ' +
    df['Snack Suggestion'].fillna('')
)

# Numerical features for similarity (profile + macros)
num_cols = ['Ages', 'Height', 'Weight', 'Protein', 'Sugar', 'Sodium', 'Calories', 'Carbohydrates', 'Fiber', 'Fat']

# Handle missing values
df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
logger.debug("Filled missing numerical values with column means")

# Fit scaler on numerical features
X_num = df[num_cols].values
scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_num)

# Fit TF-IDF on combined text
tfidf = TfidfVectorizer(stop_words='english')
X_text = tfidf.fit_transform(df['combined_text'])
logger.debug("TF-IDF vectorization completed")

# Combined feature matrix: text vectors + scaled numerics
X = np.hstack((X_text.toarray(), X_num_scaled))

@content_filtering_bp.route('/recommend', methods=['POST'])
def recommend():
    logger.debug("Received request to /recommend")
    data = request.json

    # Required inputs
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
        preferred_ingredients = data.get('preferred_ingredients', '')  # Optional
        disease = data.get('disease', '')  # Optional
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input format: {str(e)}")
        return jsonify({'error': 'Invalid input format. Ensure numerical fields are numbers.'}), 400

    # Log input
    logger.debug(f"Input: dietary_preference={dietary_preference}, activity_level={activity_level}, "
                 f"disease={disease}, ingredients={preferred_ingredients}")

    # Filter by dietary preference and activity level
    filtered = df[
        (df['Dietary Preference'].str.lower() == dietary_preference.lower()) &
        (df['Activity Level'].str.lower() == activity_level.lower())
    ]

    # Filter by disease if provided (case-insensitive partial match)
    if disease:
        filtered = filtered[filtered['Disease'].str.contains(disease, case=False, na=False)]

    filtered_idx = filtered.index
    logger.debug(f"Found {len(filtered_idx)} matching meal plans after filtering")

    # If no exact matches, relax filtering to dietary preference only
    if len(filtered_idx) == 0:
        logger.warning("No exact matches found, relaxing to dietary preference only")
        filtered = df[df['Dietary Preference'].str.lower() == dietary_preference.lower()]
        filtered_idx = filtered.index
        if len(filtered_idx) == 0:
            logger.warning("No matches for dietary preference, using full dataset")
            filtered_idx = df.index

    # Create user numerical vector
    user_num = np.array([[age, height, weight, target_protein, target_sugar, target_sodium,
                          target_calories, target_carbs, target_fiber, target_fat]])
    user_num_scaled = scaler.transform(user_num)

    # Create user text vector
    user_text_vec = tfidf.transform([preferred_ingredients])

    # Combined user vector
    user_vec = np.hstack((user_text_vec.toarray(), user_num_scaled))

    # Filtered feature matrix
    X_filtered = X[filtered_idx]

    # Compute cosine similarities
    similarities = cosine_similarity(user_vec, X_filtered)[0]
    logger.debug(f"Computed similarities: {similarities[:5]}...")  # Log first 5 for brevity

    # Get the index of the most similar meal plan
    best_filtered_idx = np.argmax(similarities)
    best_global_idx = filtered_idx[best_filtered_idx]

    # Return the recommended meal plan as dict
    recommendation = df.iloc[best_global_idx].to_dict()
    logger.debug("Recommendation generated successfully")

    return jsonify({'recommendation': recommendation})

@content_filtering_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200

