def extract_username(user_ctx: dict) -> str | None:
    try:
        return user_ctx["nodeData"]["user"]["username"]
    except (KeyError, TypeError):
        return None
