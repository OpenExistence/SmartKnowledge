# SmartKnowledge - Configuration

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
AUDIO_DIR = DATA_DIR / "audio"
TRANSCRIPTIONS_DIR = DATA_DIR / "transcriptions"
DB_DIR = DATA_DIR / "db"
VECTORS_DIR = DB_DIR / "vectors"

# Ensure directories exist
for d in [DATA_DIR, AUDIO_DIR, TRANSCRIPTIONS_DIR, DB_DIR, VECTORS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Database
SQLITE_PATH = DB_DIR / "smartknowledge.sqlite"
CHROMA_PATH = str(VECTORS_DIR)

# Flask
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
FLASK_HOST = os.environ.get("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.environ.get("FLASK_PORT", 5000))

# Upload settings
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
ALLOWED_TEXT_EXTENSIONS = {".txt", ".md"}

# Embeddings (optional)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Ollama (optional)
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama2")
