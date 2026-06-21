from typing import List, Tuple
from app.rag.vectorstore import VectorStore
from app.astrology.service import AstrologyService

class RetrievalService:
    """Service for retrieving relevant astrology documents"""
    
    def __init__(self):
        self.astrology_service = AstrologyService()
    
    async def retrieve_relevant_docs(self, user_id: str, query: str, k: int = 5) -> List[str]:
        """Retrieve relevant astrology documents for a user query"""
        
        # Get user's astrology data
        user_snippets = await self.astrology_service.get_user_astrology_data(user_id)
        
        if not user_snippets:
            return []
        
        # Create vector store and add documents
        vector_store = VectorStore()
        await vector_store.add_documents(user_snippets)
        
        # Search for relevant documents
        results = await vector_store.search(query, k)
        
        # Extract documents (ignore scores for now)
        relevant_docs = [doc for doc, score in results]
        
        return relevant_docs