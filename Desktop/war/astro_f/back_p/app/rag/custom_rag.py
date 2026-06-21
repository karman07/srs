from typing import List, Dict, Any
from app.rag.vectorstore import VectorStore
from app.rag.llm_service import LLMService
from app.astrology.service import AstrologyService

class CustomAstrologyRAG:
    """Custom RAG system using only user's astrology data"""
    
    def __init__(self):
        self.astrology_service = AstrologyService()
        self.llm_service = LLMService()
    
    async def query(self, user_id: str, question: str, k: int = 5, raw_mode: bool = False) -> Dict[str, Any]:
        """Query the RAG system with user's astrology data"""
        
        # Get user's astrology data (snippets + optional embeddings)
        user_data = await self.astrology_service.get_user_astrology_data(user_id)

        snippets = user_data.get("snippets") if isinstance(user_data, dict) else []
        embeddings = user_data.get("embeddings") if isinstance(user_data, dict) else None
        api_responses = user_data.get("api_responses") if isinstance(user_data, dict) else None

        if not snippets:
            return {
                "answer": "No astrology data found. Please fetch your birth chart data first.",
                "sources_used": 0,
                "retrieved_docs": []
            }

        # Create vector store with user's data only (use stored embeddings when available)
        vector_store = VectorStore()
        await vector_store.add_documents(snippets, embeddings=embeddings)

        # Retrieve relevant documents
        relevant_docs = await vector_store.search(question, k)
        retrieved_texts = [doc for doc, score in relevant_docs]
        
        # Generate response using retrieved astrology data and optionally the raw API responses
        answer = await self.llm_service.generate_astrology_response(
            question,
            retrieved_texts,
            api_responses=api_responses,
            raw_mode=raw_mode
        )
        
        return {
            "answer": answer,
            "sources_used": len(retrieved_texts),
            "retrieved_docs": retrieved_texts
        }