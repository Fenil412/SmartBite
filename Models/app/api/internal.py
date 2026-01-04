import hmac
import hashlib
import os
import time
from flask import Blueprint, request, jsonify
from app.db.mongo import user_collection
from app.services.user_context_service import upsert_user_context

internal_api = Blueprint("internal_api", __name__)

# Use environment variable for secret
SECRET = os.getenv("INTERNAL_HMAC_SECRET", "JOu0USVT1q5kN1wkclAttRKWA8LaxMzW")
ALLOWED_DRIFT = 300  # 5 minutes

# Helper function to verify HMAC signature
def verify_hmac(req):
    timestamp = req.headers.get("x-timestamp")
    signature = req.headers.get("x-signature")

    if not timestamp or not signature:
        return False, "Missing headers"

    # Check time drift
    now = int(time.time())
    timestamp_int = int(timestamp)
    time_diff = abs(now - timestamp_int)
    
    if time_diff > ALLOWED_DRIFT:
        return False, f"Request expired (time diff: {time_diff}s)"

    body = req.get_data(as_text=True)

    expected = hmac.new(
        SECRET.encode(),
        (timestamp + body).encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        return False, "Invalid signature"

    return True, None


@internal_api.route("/internal/delete-user/<user_id>", methods=["DELETE"])
def delete_user_context(user_id):
    valid, error = verify_hmac(request)

    if not valid:
        return jsonify({
            "success": False,
            "message": error
        }), 401
    
    user_collection.delete_one({"user.id": user_id})

    return jsonify({
        "success": True,
        "message": f"User context deleted for {user_id}"
    })

@internal_api.route("/internal/sync-user", methods=["POST"])
def sync_user():
    valid, error = verify_hmac(request)

    if not valid:
        return jsonify({
            "success": False,
            "message": error
        }), 401
    
    body = request.json
    user_id = body.get("userId")
    data = body.get("data")

    if not user_id or not data:
        return jsonify({
            "success": False,
            "message": "Invalid payload"
        }), 400

    upsert_user_context(user_id, data)

    return jsonify({
        "success": True,
        "message": "User context synced successfully"
    }), 200