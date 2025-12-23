from collections import defaultdict

_memory = defaultdict(list)

def add_message(user_id: str, role: str, content: str):
    _memory[user_id].append({"role": role, "content": content})
    return _memory[user_id][-6:]
