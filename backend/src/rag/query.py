"""RAG (Retrieval Augmented Generation) module for querying."""
import os

# Note: Requires ollama for LLM generation
# pip install ollama

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("Warning: ollama not installed. Run: pip install ollama")


class RAGQuery:
    """RAG query engine using vector store and LLM."""
    
    def __init__(self, vector_store, model_name: str = "llama2"):
        self.vector_store = vector_store
        self.model_name = model_name
        
    def query(
        self,
        question: str,
        n_results: int = 5,
        user_id: int = None,
        domaine: str = None,
        sensibilite_max: str = "tres_secret"
    ) -> dict:
        """
        Query the knowledge base.
        
        Args:
            question: User question
            n_results: Number of context chunks to retrieve
            user_id: Filter by user (optional)
            domaine: Filter by domain (optional)
            sensibilite_max: Maximum sensitivity level to include
        
        Returns:
            dict with answer and sources
        """
        # Build filter
        metadata_filter = {}
        if user_id:
            metadata_filter["utilisateur_id"] = str(user_id)
        if domaine:
            metadata_filter["domaine"] = domaine
        
        # Sensitivity levels (lower = more restricted)
        sensitivity_order = ["public", "interne", "confidentiel", "secret", "tres_secret"]
        if sensibilite_max in sensitivity_order:
            max_idx = sensitivity_order.index(sensibilite_max)
            # Include all levels up to max
            allowed = sensitivity_order[:max_idx + 1]
            # Note: ChromaDB doesn't support IN queries easily, so we'll filter post-retrieval
        
        # Search vector store
        results = self.vector_store.similarity_search(
            question,
            n_results=n_results,
            filter_metadata=metadata_filter if metadata_filter else None
        )
        
        # Filter by sensitivity
        if sensibilite_max:
            results = self._filter_by_sensitivity(results, sensibilite_max)
        
        if not results:
            return {
                "answer": "Aucune information pertinente trouvée dans la base de connaissances.",
                "sources": [],
                "error": None
            }
        
        # Build context from results
        context = self._build_context(results)
        
        # Generate answer with LLM
        answer = self._generate_answer(question, context)
        
        # Format sources
        sources = self._format_sources(results)
        
        return {
            "answer": answer,
            "sources": sources,
            "context_chunks": len(results)
        }
    
    def _filter_by_sensitivity(self, results, max_sensitivity):
        """Filter results by sensitivity level."""
        sensitivity_order = ["public", "interne", "confidentiel", "secret", "tres_secret"]
        
        if max_sensitivity not in sensitivity_order:
            return results
        
        max_idx = sensitivity_order.index(max_sensitivity)
        
        filtered = []
        for r in results:
            sens = r.get("metadata", {}).get("sensibilite", "public")
            if sens in sensitivity_order:
                if sensitivity_order.index(sens) <= max_idx:
                    filtered.append(r)
        
        return filtered
    
    def _build_context(self, results) -> str:
        """Build context string from retrieved chunks."""
        context_parts = []
        
        for i, r in enumerate(results, 1):
            text = r.get("text", "")
            meta = r.get("metadata", {})
            
            context_parts.append(
                f"[Document {i}]\n"
                f"Expert: {meta.get('expert_nom', 'N/A')}\n"
                f"Domaine: {meta.get('domaine', 'N/A')}\n"
                f"Contenu: {text}\n"
            )
        
        return "\n\n".join(context_parts)
    
    def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LLM."""
        if not OLLAMA_AVAILABLE:
            return self._generate_simple_answer(question, context)
        
        prompt = f"""Tu es un assistant expert en knowledge management. 
Utilise le contexte fourni pour répondre à la question de manière précise.

Contexte:
{context}

Question: {question}

Réponse (en français):"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
            return response.get("response", "").strip()
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._generate_simple_answer(question, context)
    
    def _generate_simple_answer(self, question: str, context: str) -> str:
        """Generate a simple answer without LLM (keyword-based)."""
        # Simple extractive QA - return most relevant chunk
        if context:
            # Return first relevant chunk as answer
            lines = context.split("\n")
            content_lines = [l for l in lines if l.startswith("Contenu:")]
            if content_lines:
                answer = content_lines[0].replace("Contenu:", "").strip()
                # Truncate if too long
                if len(answer) > 500:
                    answer = answer[:500] + "..."
                return answer
        
        return "Impossible de générer une réponse. Vérifiez que Ollama est installé et configuré."
    
    def _format_sources(self, results) -> list:
        """Format sources for display."""
        sources = []
        
        for r in results:
            meta = r.get("metadata", {})
            sources.append({
                "expert": meta.get("expert_nom", "Inconnu"),
                "domaine": meta.get("domaine", "N/A"),
                "date": meta.get("date_entretien", "N/A"),
                "excerpt": r.get("text", "")[:200] + "..." if len(r.get("text", "")) > 200 else r.get("text", ""),
                "distance": r.get("distance")
            })
        
        return sources


def create_rag_query(vector_store, model_name: str = "llama2") -> RAGQuery:
    """Create RAG query engine."""
    return RAGQuery(vector_store, model_name)
