def analyze_meals_service(meals: list, user_ctx: dict) -> dict:
    analyses = []

    allergies = set(
        a.lower() for a in (user_ctx.get("allergies") or [])
    )

    goal = (user_ctx.get("goal") or "").lower()
    weight = user_ctx.get("weight") or 70

    for meal in meals:
        n = meal.get("nutrition", {})
        score = 100
        warnings = []

        # 🔴 Allergy check
        meal_allergens = [
            a.lower() for a in meal.get("allergens", [])
        ]
        if allergies.intersection(meal_allergens):
            score -= 40
            warnings.append("Contains allergen unsafe for user")

        # 🔴 Goal-based adjustments
        if goal == "muscle_gain" and n.get("protein", 0) < 0.4 * weight:
            score -= 15
            warnings.append("Protein may be insufficient for muscle gain")

        if goal == "weight_loss" and n.get("calories", 0) > 700:
            score -= 10
            warnings.append("High calorie meal for weight loss")

        # 🔴 Sugar & sodium
        if n.get("sugar", 0) > 25:
            score -= 10
            warnings.append("High sugar content")

        if n.get("sodium", 0) > 600:
            score -= 10
            warnings.append("High sodium content")

        score = max(score, 0)

        analyses.append({
            "mealId": meal.get("id"),
            "mealName": meal.get("name"),
            "healthScore": score,
            "nutrition": n,
            "warnings": warnings,
            "verdict": (
                "Good choice" if score >= 80
                else "Moderate" if score >= 60
                else "Not recommended"
            )
        })

    return {
        "userGoal": user_ctx.get("goal"),
        "analysis": analyses
    }
