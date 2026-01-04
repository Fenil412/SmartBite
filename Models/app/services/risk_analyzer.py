def health_risk_report(meals: list, user_ctx: dict) -> dict:
    risks = []
    totals = {
        "calories": 0,
        "protein": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0,
        "fats": 0
    }

    # ✅ SAFE goal handling
    raw_goal = user_ctx.get("goal")
    if isinstance(raw_goal, str):
        diseases = set(g.strip().lower() for g in raw_goal.split(","))
    else:
        diseases = set()

    allergies = set(
        a.lower() for a in (user_ctx.get("allergies") or [])
    )

    weight = user_ctx.get("weight") or 70

    for meal in meals:
        n = meal.get("nutrition", {})

        for k in totals:
            totals[k] += n.get(k, 0)

        # 🔴 Allergy Risk
        meal_allergens = [
            a.lower() for a in meal.get("allergens", [])
        ]
        if allergies.intersection(meal_allergens):
            risks.append({
                "type": "allergy",
                "severity": "high",
                "meal": meal.get("name"),
                "message": "Contains allergen unsafe for user"
            })

        # 🔴 Diabetes Risk
        if "diabetes" in diseases:
            if n.get("sugar", 0) > 25 or n.get("glycemicIndex", 0) > 55:
                risks.append({
                    "type": "diabetes",
                    "severity": "high",
                    "meal": meal.get("name"),
                    "message": "High sugar or glycemic load"
                })

        # 🔴 Hypertension Risk
        if n.get("sodium", 0) > 600:
            risks.append({
                "type": "hypertension",
                "severity": "medium",
                "meal": meal.get("name"),
                "message": "High sodium content"
            })

        # 🔴 Heart Risk
        if n.get("fats", 0) > 30:
            risks.append({
                "type": "heart",
                "severity": "medium",
                "meal": meal.get("name"),
                "message": "High fat content"
            })

    insights = []

    if totals["fiber"] < 25:
        insights.append("Low fiber intake across meals")

    if totals["protein"] < 0.8 * weight:
        insights.append("Protein intake below recommended level")

    if totals["sodium"] > 2300:
        insights.append("Excess sodium intake")

    return {
        "summary": {
            "totalCalories": totals["calories"],
            "totalProtein": totals["protein"],
            "totalFiber": totals["fiber"],
            "totalSugar": totals["sugar"],
            "totalSodium": totals["sodium"]
        },
        "detectedRisks": risks,
        "insights": insights,
        "recommendations": [
            "Increase vegetables and whole grains",
            "Prefer low sodium meals",
            "Avoid meals with known allergens"
        ]
    }
