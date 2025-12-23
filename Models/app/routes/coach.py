from flask import Blueprint, request, jsonify
from app.utils.groq_client import groq_chat
from app.memory.coach_memory import add_message

coach_bp = Blueprint("coach", __name__)

@coach_bp.route("/", methods=["POST"])
def coach():
    user_id = request.json["userId"]
    message = request.json["message"]

    memory = add_message(user_id, "user", message)
    reply = groq_chat(message, memory)
    add_message(user_id, "assistant", reply)

    return jsonify({"reply": reply})
