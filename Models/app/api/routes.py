import requests
import os
from flask import Blueprint, request
from app.services.user_context_service import upsert_user_context
from app.services.nutrition_engine import analyze_meals_service
from app.services.risk_analyzer import health_risk_report
from app.services.groq_service import chat_ai
from app.services.history_service import save_history, fetch_history
from app.models.schemas import MealPayload
from app.services.ml_model import predict_distribution
from app.services.weekly_optimizer import optimize_week
from app.services.user_context_resolver import resolve_user_context
from app.services.ai_meal_generator import generate_meals
from app.services.normalize import normalize_payload
from app.utils.response import success
from app.services.weekly_summary_service import generate_weekly_summary
from app.utils.user_context import normalize_user_context
from app.utils.user_helpers import extract_username
from app.services.nutrition_impact_service import generate_nutrition_impact
from app.constants.prompts import CHAT_SYSTEM_PROMPT
from app.constants.chat_prompts import (
    DOMAIN_GUARD_PROMPT,
    LANGUAGE_PROMPTS
)


api = Blueprint("api", __name__)

@api.route("/health")
def health():
    return success("SmartBite AI running")

@api.route("/internal/sync-user-context", methods=["POST"])
def sync_user_context():
    body = request.json
    user_id = body.get("userId")
    node_data = body.get("data")

    if not user_id or not node_data:
        return {"success": False}, 400

    upsert_user_context(user_id, node_data)

    return {"success": True}


@api.route("/analyze-meals", methods=["POST"])
def analyze():
    body = request.json
    user_id = body["userId"]
    meals = body["meals"]

    user_data = resolve_user_context(user_id)

    if not meals:
        return {
            "success": False,
            "message": "meals are required",
            "data": None
        }, 400
    
    username = extract_username(user_data)

    if not username:
        return {
            "success": False,
            "message": "Username missing in user context",
            "data": None
        }, 400

    result = analyze_meals_service(meals, user_data["nodeData"])

    save_history(
        username,
        "meal_analysis",
        result
    )

    return success(result)


@api.route("/generate-weekly-plan", methods=["POST"])
def generate_weekly_plan_v3():
    body = request.json

    profile = body["profile"]
    targets = body["targets"]
    user_id = body["userId"]

    distribution = predict_distribution(profile)
    weekly_cals = optimize_week(targets["dailyCalorieTarget"])

    user_data = resolve_user_context(user_id)

    username = extract_username(user_data)

    if not username:
        return {
            "success": False,
            "message": "Username missing in user context",
            "data": None
        }, 400
    
    user_ctx = normalize_user_context(user_data)

    if not user_ctx:
        return {
            "success": False,
            "message": "userData is required",
            "data": None
        }, 400

    weekly_plan = {}
    for i, day in enumerate(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]):
        weekly_plan[day] = generate_meals(distribution, profile)

    save_history(username, "weekly_plan", weekly_plan)

    return success({
        "userId": body["userId"],
        "weeklyPlan": weekly_plan
    })

@api.route("/health-risk-report", methods=["POST"])
def risk():
    body = request.json

    user_id = body.get("userId")
    meals = body.get("meals")

    if not user_id or not meals:
        return {
            "success": False,
            "message": "userId and meals are required",
            "data": None
        }, 400

    # 1️⃣ Resolve user context
    user_ctx = resolve_user_context(user_id)

    if not user_ctx:
        return {
            "success": False,
            "message": "User context not found",
            "data": None
        }, 404

    # 2️⃣ Extract username (CORRECT PATH)
    username = extract_username(user_ctx)

    if not username:
        return {
            "success": False,
            "message": "Username missing in user context",
            "data": None
        }, 400

    # 3️⃣ Run risk analysis using nodeData
    report = health_risk_report(
        meals,
        user_ctx["nodeData"]     # 👈 IMPORTANT
    )

    # 4️⃣ Save history by username
    save_history(
        username,
        "health_risk_report",
        report
    )

    return success(report)


@api.route("/chat/generateResponse", methods=["POST"])
def generate_response():
    data = request.json or {}

    # 1️⃣ Validate inputs safely
    user_id = data.get("userId")
    message = data.get("message", "").strip()
    language = data.get("language", "en-US")

    if not user_id:
        return {
            "success": False,
            "message": "userId is required"
        }, 400

    if not message:
        return {
            "success": False,
            "message": "Empty message"
        }, 400

    # 2️⃣ Resolve stored Node → Flask user context
    raw_user_ctx = resolve_user_context(user_id)

    if not raw_user_ctx:
        return {
            "success": False,
            "message": "User context not found",
            "data": None
        }, 404

    # 3️⃣ Extract username BEFORE normalization
    username = extract_username(raw_user_ctx)

    if not username:
        return {
            "success": False,
            "message": "Username missing in user context",
            "data": None
        }, 400

    # 4️⃣ Normalize user context for AI
    user_ctx = normalize_user_context(raw_user_ctx)

    # 5️⃣ Language instruction
    language_instruction = LANGUAGE_PROMPTS.get(
        language, LANGUAGE_PROMPTS["en-US"]
    )

    # 6️⃣ Context block (safe access everywhere)
    context_block = f"""
User Context (use only if relevant):
Age: {user_ctx.get("age")}
Goal: {user_ctx.get("goal")}
Diet: {user_ctx.get("dietaryPreferences")}
Allergies: {user_ctx.get("allergies")}
Preferred Cuisines: {user_ctx.get("preferredCuisines")}
Cooking Time: {user_ctx.get("maxCookTime")} mins
Avoid meals: {user_ctx.get("skippedMeals")}
Prefer meals: {user_ctx.get("likedMeals")}
"""

    # 7️⃣ System prompt
    system_prompt = f"""
{DOMAIN_GUARD_PROMPT}
{language_instruction}
{CHAT_SYSTEM_PROMPT}

You are SmartBite AI.
- Only answer food, nutrition, health, diet, and meal planning questions
- Politely refuse all other domains
- Personalize using user context when helpful
- Never provide medical diagnosis
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": context_block},
            {"role": "user", "content": message}
        ],
        "temperature": 0.4,
        "max_tokens": 600
    }

    # 8️⃣ Call GROQ safely
    try:
        groq_response = requests.post(
            os.getenv("GROQ_API_URL"),
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )

        result = groq_response.json()

        reply = (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content")
        )

        if not reply:
            reply = (
                "I can help only with food, nutrition, and meal planning."
                if language == "en-US"
                else "मैं केवल भोजन और पोषण से संबंधित प्रश्नों में सहायता कर सकता हूँ।"
                if language == "hi-IN"
                else "હું ફક્ત ભોજન અને પોષણ સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું."
            )

    except Exception as e:
        reply = "Unable to generate response at the moment."

    # 9️⃣ Save history using USERNAME (not userId)
    save_history(
        username,
        "chat",
        {
            "question": message,
            "answer": reply,
            "language": language
        }
    )

    return {
        "success": True,
        "message": reply
    }


@api.route("/history/<userId>")
def history(userId):
    return success(fetch_history(userId))

@api.route("/summarize-weekly-meal", methods=["POST"])
def summarize_weekly_meal():
    body = request.json

    user_id = body.get("userId")
    weekly_plan = body.get("weeklyPlan")

    user_data = resolve_user_context(user_id)
    user_ctx = normalize_user_context(user_data)

    if not user_ctx:
        return {
            "success": False,
            "message": "userData is required",
            "data": None
        }, 400
    
    username = extract_username(user_ctx)

    if not username:
        return {
            "success": False,
            "message": "Username missing in user context",
            "data": None
        }, 400


    if not user_id or not weekly_plan:
        return {
            "success": False,
            "message": "userId and weeklyPlan are required",
            "data": None
        }, 400

    summary = generate_weekly_summary(user_id, weekly_plan)

    save_history(
        username,
        "Summarize weekly meal",
        summary
    )

    return success({
        "summary": summary
    })

@api.route("/nutrition-impact-summary", methods=["POST"])
def nutrition_impact_summary():

    body = request.json or {}
    user_id = body.get("userId")
    weekly_plan = body.get("weeklyPlan")
    health_risk = body.get("healthRiskReport")

    if not user_id:
        return {"success": False, "message": "userId required"}, 400

    user_data = resolve_user_context(user_id)

    username = extract_username(user_data)
    if not username:
        return {"success": False, "message": "Username missing in user context"}, 400
    
    user_ctx = normalize_user_context(user_data)

    if not user_ctx:
        return {"success": False, "message": "User context not found"}, 404

    summary = generate_nutrition_impact(
        user_ctx=user_ctx,
        weekly_plan=weekly_plan["data"]["weeklyPlan"],
        health_risk=health_risk["data"]
    )

    save_history(
        username,
        "nutrition_impact_summary",
        summary
    )

    return success(summary)
