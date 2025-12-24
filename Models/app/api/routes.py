from flask import Blueprint, request
from app.services.nutrition_engine import analyze_meals_service
from app.services.meal_planner import generate_weekly_plan
from app.services.risk_analyzer import health_risk_report
from app.services.groq_service import chat_ai
from app.services.history_service import save_history, fetch_history
from app.models.schemas import MealPayload
from app.services.normalize import normalize_payload
from app.utils.response import success

api = Blueprint("api", __name__)

@api.route("/health")
def health():
    return success("SmartBite AI running")

@api.route("/analyze-meals", methods=["POST"])
def analyze():
    payload = MealPayload(**request.json)      # validation
    normalized = normalize_payload(payload.dict())
    result = analyze_meals_service(normalized)  # ✅ renamed service
    return success(result)

@api.route("/generate-weekly-plan", methods=["POST"])
def weekly():
    data = generate_weekly_plan(request.json)
    save_history(request.json["userId"], "weekly_plan", data)
    return success(data)

@api.route("/health-risk-report", methods=["POST"])
def risk():
    return success(health_risk_report(request.json))

@api.route("/chat", methods=["POST"])
def chat():
    reply = chat_ai(request.json)
    save_history(request.json["userId"], "chat", reply)
    return success(reply)

@api.route("/history/<userId>")
def history(userId):
    return success(fetch_history(userId))

@api.route("/analyze-meals", methods=["POST"])
def analyze_meals():
    payload = MealPayload(**request.json)  # VALIDATION
    normalized = normalize_payload(payload.dict())
    return success(normalized)
