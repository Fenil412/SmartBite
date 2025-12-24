# app/services/nutrition_engine.py

def analyze_meals_service(payload):
    """
    Analyze meals and compute health score.
    """

    if not payload or "data" not in payload:
        return []

    results = []

    for meal in payload["data"]:
        nutrition = meal.get("nutrition", {})

        score = 100
        if nutrition.get("sodium", 0) > 400:
            score -= 15
        if nutrition.get("sugar", 0) > 10:
            score -= 10
        if nutrition.get("fiber", 0) < 8:
            score -= 10
        if nutrition.get("protein", 0) < 20:
            score -= 5

        meal["healthScore"] = max(score, 40)
        results.append(meal)

    return results
