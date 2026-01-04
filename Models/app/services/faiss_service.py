try:
    import faiss
    import numpy as np
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("Warning: FAISS not available. Vector search functionality disabled.")

# ✅ LAZY LOADING - No index created at startup (prevents OOM)
index = None

def get_faiss_index():
    """
    Lazy load FAISS index only when needed (prevents startup OOM)
    """
    global index
    if not FAISS_AVAILABLE:
        return None
    
    if index is None:
        try:
            index = faiss.IndexFlatL2(384)
            print("FAISS index created successfully")
        except Exception as e:
            print(f"Error creating FAISS index: {e}")
            return None
    
    return index

def add_embeddings(vectors):
    """
    Add embeddings to lazy-loaded FAISS index
    """
    current_index = get_faiss_index()
    
    if not FAISS_AVAILABLE or current_index is None:
        return {"error": "FAISS not available", "success": False}
    
    try:
        current_index.add(np.array(vectors).astype("float32"))
        return {"success": True}
    except Exception as e:
        return {"error": str(e), "success": False}

def search(query_vector, k=5):
    """
    Search using lazy-loaded FAISS index
    """
    current_index = get_faiss_index()
    
    if not FAISS_AVAILABLE or current_index is None:
        return {"error": "FAISS not available", "results": []}
    
    try:
        D, I = current_index.search(np.array([query_vector]).astype("float32"), k)
        return {"results": I.tolist(), "success": True}
    except Exception as e:
        return {"error": str(e), "results": []}