from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
import logging
import re

variety_clustering_bp = Blueprint("variety_clustering", __name__)

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

# Fit scaler for numerical features
X_num = df[num_cols].values
scaler = StandardScaler()
X_num_scaled = scaler.fit_transform(X_num)

# Fit TF-IDF
tfidf = TfidfVectorizer(stop_words='english')
X_text = tfidf.fit_transform(df['combined_text'])
logger.debug("TF-IDF vectorization completed")

# Combined features for ranking
X = np.hstack((X_text.toarray(), X_num_scaled))

# Step 1: K-Means Clustering on Macros
macro_cols = ['Calories', 'Protein', 'Carbohydrates', 'Fat']
X_macro = df[macro_cols]
macro_scaler = StandardScaler()
X_macro_scaled = macro_scaler.fit_transform(X_macro)

# Apply K-Means (3 clusters for high-protein, low-carb, balanced)
kmeans = KMeans(n_clusters=3, random_state=42)
df['cluster'] = kmeans.fit_predict(X_macro_scaled)
logger.debug(f"K-Means clustering completed. Cluster counts: {df['cluster'].value_counts().to_dict()}")

# Label clusters based on characteristics
cluster_centers = macro_scaler.inverse_transform(kmeans.cluster_centers_)
cluster_labels = []
for i, center in enumerate(cluster_centers):
    calories, protein, carbs, fat = center
    if carbs < df['Carbohydrates'].mean():
        label = 'Low-Carb'
    elif protein > df['Protein'].mean():
        label = 'High-Protein'
    else:
        label = 'Balanced'
    cluster_labels.append(label)
logger.debug(f"Cluster labels: {dict(zip(range(len(cluster_labels)), cluster_labels))}")

# Apply cluster labels to DataFrame
df['cluster_label'] = df['cluster'].map(dict(zip(range(len(cluster_labels)), cluster_labels)))

# Step 2: Train Random Forest for keto/low-carb classification
df['is_low_carb'] = (df['Carbohydrates'] < 200).astype(int)
clf = RandomForestClassifier(random_state=42)
clf.fit(X_macro, df['is_low_carb'])
logger.debug(f"Trained Random Forest Classifier for low-carb/keto prediction")

# Define excluded words for rule-based filtering
excluded_words = {
    'Vegan': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish', 'egg', 'yogurt', 'cheese', 'honey'],
    'Vegetarian': ['chicken', 'salmon', 'steak', 'beef', 'turkey', 'fish'],
    'Omnivore': []
}

@variety_clustering_bp.route('/recommend', methods=['POST'])
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
        days = int(data.get('days', 7))  # Default to 7 days for weekly plan
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input format: {str(e)}")
        return jsonify({'error': 'Invalid input format. Ensure numerical fields are numbers.'}), 400

    logger.debug(f"Input: dietary_preference={dietary_preference}, activity_level={activity_level}, "
                 f"disease={disease}, ingredients={preferred_ingredients}, days={days}")

    # Step 1: Rule-Based Filtering
    if dietary_preference.lower() in [pref.lower() for pref in df['Dietary Preference'].unique()]:
        filtered = df[
            (df['Dietary Preference'].str.lower() == dietary_preference.lower()) &
            (df['Activity Level'].str.lower() == activity_level.lower())
        ]
    else:
        filtered = df[df['Activity Level'].str.lower() == activity_level.lower()]

    if disease:
        filtered = filtered[filtered['Disease'].str.contains(disease, case=False, na=False)]

    pref_key = dietary_preference.capitalize()
    if pref_key in excluded_words:
        excluded = excluded_words[pref_key]
        if excluded:
            pattern = r'\b(?:' + '|'.join(re.escape(word) for word in excluded) + r')\b'
            mask = ~filtered['combined_text'].str.lower().str.contains(pattern, na=False)
            filtered = filtered[mask]
            logger.debug(f"Applied keyword exclusion for {dietary_preference}; remaining: {len(filtered)}")

    if 'keto' in dietary_preference.lower():
        pred = clf.predict(filtered[macro_cols])
        filtered = filtered[pred == 1]
        logger.debug(f"Applied ML filter for keto/low-carb; remaining: {len(filtered)}")

    filtered_idx = filtered.index
    logger.debug(f"Found {len(filtered_idx)} matching meal plans after filtering")

    if len(filtered_idx) == 0:
        logger.warning("No exact matches found, relaxing filters")
        filtered = df[df['Dietary Preference'].str.lower().str.contains('omni|veg', na=False)]
        filtered_idx = filtered.index

    # Create user vectors
    user_num = np.array([[age, height, weight, target_protein, target_sugar, target_sodium,
                          target_calories, target_carbs, target_fiber, target_fat]])
    user_num_scaled = scaler.transform(user_num)
    user_text_vec = tfidf.transform([preferred_ingredients])
    user_vec = np.hstack((user_text_vec.toarray(), user_num_scaled))

    # Step 3: Generate Diverse Weekly Plan
    weekly_plan = []
    available_clusters = filtered['cluster'].unique()
    logger.debug(f"Available clusters: {available_clusters}")

    # Distribute days across clusters for variety
    meals_per_cluster = max(1, days // max(1, len(available_clusters)))
    remaining_days = days % max(1, len(available_clusters))

    for cluster in available_clusters:
        cluster_meals = filtered[filtered['cluster'] == cluster]
        cluster_idx = cluster_meals.index
        if len(cluster_idx) == 0:
            continue

        # Compute similarities for this cluster
        X_cluster = X[cluster_idx]
        similarities = cosine_similarity(user_vec, X_cluster)[0]
        sorted_indices = np.argsort(similarities)[::-1]
        top_n = min(meals_per_cluster + (1 if remaining_days > 0 else 0), len(cluster_idx))
        remaining_days = max(0, remaining_days - 1)

        # Add top meals from this cluster
        for i in range(top_n):
            best_idx = cluster_idx[sorted_indices[i]]
            meal = df.iloc[best_idx].to_dict()
            weekly_plan.append({
                'day': len(weekly_plan) + 1,
                'meal': meal,
                'cluster_label': meal['cluster_label']
            })

    # If not enough meals, fill with top matches from any cluster
    while len(weekly_plan) < days and len(filtered_idx) > 0:
        X_filtered = X[filtered_idx]
        similarities = cosine_similarity(user_vec, X_filtered)[0]
        sorted_indices = np.argsort(similarities)[::-1]
        for i in sorted_indices:
            best_idx = filtered_idx[i]
            if best_idx not in [m['meal']['index'] for m in weekly_plan]:
                meal = df.iloc[best_idx].to_dict()
                weekly_plan.append({
                    'day': len(weekly_plan) + 1,
                    'meal': meal,
                    'cluster_label': meal['cluster_label']
                })
                break

    logger.debug(f"Generated weekly plan with {len(weekly_plan)} meals")
    return jsonify({'weekly_plan': weekly_plan})

@variety_clustering_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200