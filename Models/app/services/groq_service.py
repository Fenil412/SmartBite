import requests, os
from app.constants.prompts import CHAT_SYSTEM_PROMPT

def chat_ai(payload):
    res = requests.post(
        os.getenv("GROQ_API_URL"),
        headers={
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                {"role": "user", "content": payload["message"]}
            ]
        }
    )
    return res.json()["choices"][0]["message"]["content"]
