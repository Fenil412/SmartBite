def normalize_user_context(node_payload: dict) -> dict:
    user = node_payload.get("user", {})
    constraints = node_payload.get("constraints", {})
    feedback = node_payload.get("feedback", [])
    adherence = node_payload.get("adherenceHistory", [])

    return {
        "userId": user.get("id"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "height": user.get("heightCm"),
        "weight": user.get("weightKg"),
        "activityLevel": user.get("activityLevel"),
        "goal": user.get("goal"),

        "dietaryPreferences": user.get("dietaryPreferences", []),
        "dietaryRestrictions": user.get("dietaryRestrictions", []),
        "allergies": user.get("allergies", []),
        "preferredCuisines": user.get("preferredCuisines", []),
        "budgetTier": user.get("budgetTier"),

        "appliances": constraints.get("appliances", []),
        "maxCookTime": constraints.get("maxCookTime"),
        "skillLevel": constraints.get("skillLevel"),
        "cookingDays": constraints.get("cookingDays", []),

        "likedMeals": [f["meal"] for f in feedback if f["type"] == "liked"],
        "skippedMeals": [a["meal"] for a in adherence if a["status"] == "skipped"]
    }
