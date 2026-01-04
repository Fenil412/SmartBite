try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: SentenceTransformers not available. Text embedding functionality disabled.")

# ✅ LAZY LOADING - No model loaded at startup (prevents OOM)
model = None

def get_embedding_model():
    """
    Lazy load embedding model only when needed (prevents startup OOM)
    """
    global model
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        return None
    
    if model is None:
        try:
            model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Embedding model loaded successfully")
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            return None
    
    return model

def embed(texts):
    """
    Generate embeddings using lazy-loaded model
    """
    current_model = get_embedding_model()
    
    if not SENTENCE_TRANSFORMERS_AVAILABLE or current_model is None:
        # Return dummy embeddings or use a simple hash-based approach
        return {"error": "SentenceTransformers not available", "embeddings": []}
    
    try:
        embeddings = current_model.encode(texts)
        return {"embeddings": embeddings.tolist(), "success": True}
    except Exception as e:
        return {"error": str(e), "embeddings": []}