import requests
import os

NODE_BASE_URL = os.getenv("NODE_BACKEND_URL")
NODE_KEY = os.getenv("NODE_INTERNAL_KEY")

def fetch_user_context_from_node(user_id: str):
    url = f"{NODE_BASE_URL}/internal/ai/user-context/{user_id}"

    res = requests.get(
        url,
        headers={
            "x-internal-key": NODE_KEY
        },
        timeout=10
    )

    if res.status_code != 200:
        return None

    return res.json().get("data")
