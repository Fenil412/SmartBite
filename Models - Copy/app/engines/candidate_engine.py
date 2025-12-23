def filter_candidates(meals: list, user: dict):
    constraints = user.get("constraints", {})
    allergies = set(user.get("profile", {}).get("allergies", []))
    restrictions = set(user.get("profile", {}).get("dietaryRestrictions", []))

    filtered = []

    for meal in meals:
        if allergies.intersection(set(meal.get("allergens", []))):
            continue

        if meal.get("cookTime", 0) > constraints.get("maxCookTime", 30):
            continue

        if (
            "skillLevel" in constraints
            and meal.get("skillLevel") != constraints["skillLevel"]
        ):
            continue

        filtered.append(meal)

    return filtered
