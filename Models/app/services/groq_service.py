import requests
import os
import logging
from app.constants.prompts import CHAT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

def chat_ai(payload):
    if "message" not in payload:
        raise ValueError("Missing 'message' in request body")

    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": CHAT_SYSTEM_PROMPT},
            {"role": "user", "content": payload["message"]}
        ]
    }

    res = requests.post(
        os.getenv("GROQ_API_URL"),
        headers=headers,
        json=body,
        timeout=30
    )

    try:
        data = res.json()
    except Exception:
        logger.error("Groq returned non-JSON response")
        raise RuntimeError("Invalid Groq response")

    # ✅ HANDLE ERROR RESPONSE
    if "error" in data:
        raise RuntimeError(f"Groq API error: {data['error']}")

    # ✅ HANDLE EXPECTED RESPONSE
    if "choices" not in data:
        raise RuntimeError(f"Unexpected Groq response format: {data}")

    return data["choices"][0]["message"]["content"]
