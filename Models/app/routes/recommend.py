from flask import Blueprint, request, jsonify
from app.utils.mongo_client import db
from app.engines.candidate_engine import filter_candidates
from app.engines.ranking_engine import rank_meals
from app.engines.plan_engine import build_weekly_plan

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/", methods=["POST"])
def recommend():
    payload = request.json

    user = payload["user"]
    meals = payload["meals"]

    candidates = filter_candidates(meals, user)
    ranked = rank_meals(candidates, user["profile"])
    weekly_plan = build_weekly_plan(ranked, payload["targetCalories"])

    return jsonify({
        "weeklyPlan": weekly_plan
    })
