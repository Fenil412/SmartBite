def analyze_meals(payload):
    output = []
    for meal in payload["data"]:
        n = meal["nutrition"]
        score = 100
        if n["sodium"] > 400: score -= 15
        if n["sugar"] > 10: score -= 10
        if n["fiber"] < 8: score -= 10

        meal["healthScore"] = max(score, 40)
        output.append(meal)
    return output
