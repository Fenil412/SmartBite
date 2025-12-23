# app/services/risk_analyzer.py

def health_risk_report(payload):
    risks = []

    for meal in payload["data"]:
        nutrition = meal["nutrition"]

        if nutrition.get("glycemicIndex", 0) > 55:
            risks.append({
                "meal": meal["name"],
                "risk": "High glycemic index (diabetes risk)"
            })

        if nutrition.get("sodium", 0) > 500:
            risks.append({
                "meal": meal["name"],
                "risk": "High sodium (blood pressure risk)"
            })

        if nutrition.get("sugar", 0) > 15:
            risks.append({
                "meal": meal["name"],
                "risk": "High sugar (metabolic risk)"
            })

    return {
        "overallRisk": "LOW" if not risks else "MODERATE",
        "details": risks
    }
