import faiss
import numpy as np


index = faiss.IndexFlatL2(384)

def add_embeddings(vectors):
    index.add(np.array(vectors).astype("float32"))

def search(query_vector, k=5):
    D, I = index.search(np.array([query_vector]).astype("float32"), k)
    return I.tolist()
