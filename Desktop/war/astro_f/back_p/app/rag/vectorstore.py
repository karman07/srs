import numpy as np
from typing import List, Tuple
from app.rag.embeddings import EmbeddingService
from sklearn.metrics.pairwise import cosine_similarity

class VectorStore:
    """Simple vector store for document retrieval using cosine similarity"""
    
    def __init__(self):
        self.documents = []
        self.embeddings = []
        self.embedding_service = EmbeddingService()
    
    async def add_documents(self, documents: List[str], embeddings: List[List[float]] = None) -> None:
        """Add documents to the vector store.

        If `embeddings` is provided it will be used directly (expects list of lists).
        Otherwise embeddings are generated via the embedding service.
        """
        if not documents:
            return

        if embeddings:
            # trust provided embeddings (normalize to list of lists)
            self.documents.extend(documents)
            self.embeddings.extend(embeddings)
            return

        # Generate embeddings
        embeddings_generated = await self.embedding_service.get_embeddings(documents)

        if embeddings_generated:
            self.documents.extend(documents)
            self.embeddings.extend(embeddings_generated)
    
    async def search(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar documents"""
        if not self.embeddings:
            return []
        
        # Generate query embedding
        query_embedding = await self.embedding_service.get_single_embedding(query)
        
        if not query_embedding:
            return []
        
        # Calculate cosine similarities
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        
        # Get top k results
        top_indices = np.argsort(similarities)[::-1][:k]
        
        results = []
        for idx in top_indices:
            if idx < len(self.documents):
                results.append((self.documents[idx], float(similarities[idx])))
        
        return results
    
    def clear(self):
        """Clear the vector store"""
        self.documents = []
        self.embeddings = []