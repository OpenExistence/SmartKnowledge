"""Vector database using ChromaDB."""
import os
import json
from datetime import datetime, date
from pathlib import Path

# Note: Requires chromadb and sentence-transformers
# pip install chromadb sentence-transformers

try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    print("Warning: chromadb not installed. Run: pip install chromadb")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: sentence-transformers not installed. Run: pip install sentence-transformers")


class VectorStore:
    """ChromaDB vector store for RAG."""
    
    def __init__(self, persist_directory: str = "data/db/vectors"):
        if not CHROMA_AVAILABLE:
            raise ImportError("ChromaDB not installed")
        
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection = None
        
    def get_or_create_collection(self, name: str = "entretiens"):
        """Get or create a collection."""
        self.collection = self.client.get_or_create_collection(
            name=name,
            metadata={"description": "SmartKnowledge interviews"}
        )
        return self.collection
    
    def load_embedding_model(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Load the embedding model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError("sentence-transformers not installed")
        
        print(f"Loading embedding model: {model_name}")
        self.embedding_model = SentenceTransformer(model_name)
        return self.embedding_model
    
    def add_transcription(
        self,
        entretien_id: int,
        transcription_text: str,
        metadata: dict
    ):
        """
        Add a transcription to the vector store.
        
        Args:
            entretien_id: ID of the interview
            transcription_text: Full transcription text
            metadata: Dict with expert_nom, domaine, date, etc.
        """
        if not self.collection:
            self.get_or_create_collection()
        
        if not hasattr(self, 'embedding_model'):
            self.load_embedding_model()
        
        # Split text into chunks
        chunks = self._split_into_chunks(transcription_text)
        
        # Generate embeddings
        embeddings = self.embedding_model.encode(chunks).tolist()
        
        # Prepare metadata - convert all values to strings
        metadatas = []
        for i, chunk in enumerate(chunks):
            meta = {}
            for key, value in metadata.items():
                if value is None:
                    meta[key] = ""
                elif isinstance(value, (datetime, date)):
                    meta[key] = value.isoformat()
                else:
                    meta[key] = str(value)
            meta["entretien_id"] = str(entretien_id)
            meta["chunk_index"] = i
            meta["chunk_text"] = chunk[:200]  # Truncate for storage
            metadatas.append(meta)
        
        # Add to collection
        ids = [f"entretien_{entretien_id}_chunk_{i}" for i in range(len(chunks))]
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        
        return {"chunks": len(chunks)}
    
    def similarity_search(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: dict = None
    ) -> list:
        """
        Search for similar chunks.
        
        Args:
            query: Search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filter
        
        Returns:
            List of dicts with text and metadata
        """
        if not self.collection:
            self.get_or_create_collection()
        
        if not hasattr(self, 'embedding_model'):
            self.load_embedding_model()
        
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        # Search
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results,
            where=filter_metadata
        )
        
        # Format results
        formatted = []
        for i in range(len(results["ids"][0])):
            formatted.append({
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i] if "distances" in results else None
            })
        
        return formatted
    
    def delete_entretien(self, entretien_id: int):
        """Delete all chunks for an entretien."""
        if not self.collection:
            self.get_or_create_collection()
        
        # Get all IDs for this entretien
        all_ids = self.collection.get()["ids"]
        ids_to_delete = [id for id in all_ids if f"entretien_{entretien_id}_chunk_" in id]
        
        if ids_to_delete:
            self.collection.delete(ids=ids_to_delete)
        
        return {"deleted": len(ids_to_delete)}
    
    def _split_into_chunks(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list:
        """Split text into overlapping chunks."""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                for sep in ['. ', '! ', '? ', '\n']:
                    last_sep = text[start:end].rfind(sep)
                    if last_sep != -1:
                        end = start + last_sep + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
        
        return chunks


def init_vector_store(persist_dir: str = "data/db/vectors") -> VectorStore:
    """Initialize and return vector store."""
    return VectorStore(persist_directory=persist_dir)


if __name__ == "__main__":
    # Test
    store = VectorStore()
    store.get_or_create_collection()
    print("Vector store initialized")
