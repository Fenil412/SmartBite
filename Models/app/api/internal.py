import hmac
import hashlib
import os
import time
from flask import Blueprint, request, jsonify
from app.db.mongo import user_collection
from app.services.user_context_service import upsert_user_context

internal_api = Blueprint("internal_api", __name__)

# Hardcode the secret to ensure it works
SECRET = "JOu0USVT1q5kN1wkclAttRKWA8LaxMzW"
ALLOWED_DRIFT = 300  # 5 minutes

print(f"🔧 Flask Internal API loaded with SECRET: {SECRET[:10]}...")

# Helper function to verify HMAC signature
def verify_hmac(req):
    timestamp = req.headers.get("x-timestamp")
    signature = req.headers.get("x-signature")

    print(f"🔍 HMAC Verification:")
    print(f"   Timestamp: {timestamp}")
    print(f"   Signature: {signature}")

    if not timestamp or not signature:
        print("   ❌ Missing headers")
        return False, "Missing headers"

    # Check time drift
    now = int(time.time())
    timestamp_int = int(timestamp)
    time_diff = abs(now - timestamp_int)
    
    print(f"   Server time: {now}")
    print(f"   Request time: {timestamp_int}")
    print(f"   Time diff: {time_diff}s (allowed: {ALLOWED_DRIFT}s)")
    
    if time_diff > ALLOWED_DRIFT:
        print(f"   ❌ Request expired")
        return False, f"Request expired (time diff: {time_diff}s)"

    body = req.get_data(as_text=True)
    print(f"   Body: {body}")
    print(f"   Body length: {len(body)}")

    expected = hmac.new(
        SECRET.encode(),
        (timestamp + body).encode(),
        hashlib.sha256
    ).hexdigest()
    
    print(f"   Expected: {expected}")
    print(f"   Received: {signature}")
    print(f"   Match: {hmac.compare_digest(expected, signature)}")

    if not hmac.compare_digest(expected, signature):
        print("   ❌ Invalid signature")
        return False, "Invalid signature"

    print("   ✅ HMAC verification passed!")
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
    print("🚀 Flask sync-user endpoint called!")
    
    valid, error = verify_hmac(request)

    if not valid:
        print(f"❌ HMAC verification failed: {error}")
        return jsonify({
            "success": False,
            "message": error
        }), 401

    print("✅ HMAC verification passed!")
    
    body = request.json
    user_id = body.get("userId")
    data = body.get("data")

    if not user_id or not data:
        print("❌ Invalid payload - missing userId or data")
        return jsonify({
            "success": False,
            "message": "Invalid payload"
        }), 400

    print(f"💾 Storing user context for user: {user_id}")
    upsert_user_context(user_id, data)
    print("✅ User context stored successfully!")

    return jsonify({
        "success": True,
        "message": "User context synced successfully"
    }), 200