try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

import numpy as np

# Lazy loading to prevent memory issues during startup
_index = None

def get_index():
    global _index
    if not FAISS_AVAILABLE:
        return None
    if _index is None:
        _index = faiss.IndexFlatL2(384)
    return _index

def add_embeddings(vectors):
    index = get_index()
    if index is None:
        return  # Skip if FAISS is not available
    index.add(np.array(vectors).astype("float32"))

def search(query_vector, k=5):
    index = get_index()
    if index is None:
        # Return dummy results if FAISS is not available
        return [[0] * k]
    D, I = index.search(np.array([query_vector]).astype("float32"), k)
    return I.tolist()
