# app/utils/groq_client.py
import requests
from app.config import Config

def groq_chat(prompt, memory=None):
    messages = memory or []
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "mixtral-8x7b",
        "messages": messages
    }

    headers = {
        "Authorization": f"Bearer {Config.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        json=payload,
        headers=headers,
        timeout=20
    )

    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
