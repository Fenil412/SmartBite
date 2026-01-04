from app.services.embedding_service import embed

def normalize_payload(payload):
    for meal in payload["data"]:
        if not meal["embedding"]:
            text = meal["name"] + " " + " ".join(meal["ingredients"])
            meal["embedding"] = embed([text])[0].tolist()
    return payload
