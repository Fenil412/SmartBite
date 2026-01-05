try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Lazy loading to prevent memory issues during startup
_model = None

def get_model():
    global _model
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        return None
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def embed(texts):
    model = get_model()
    if model is None:
        # Return dummy embeddings if model is not available
        return [[0.0] * 384 for _ in texts]
    return model.encode(texts)
