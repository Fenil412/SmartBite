from flask import Blueprint, request, jsonify
from app.learning.feedback_processor import process_feedback

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/", methods=["POST"])
def feedback():
    process_feedback(request.json)
    return jsonify({"success": True})
