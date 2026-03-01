# SmartKnowledge

Outil de capture et valorisation des connaissances expertes pour préserver et diffuser le savoir des seniors vers les nouveaux embauchés.

## Fonctionnalités

- 🎙️ **Enregistrement audio** d'entretiens
- 📝 **Transcription** automatique avec Whisper
- 🔍 **Vectorisation** pour recherche sémantique
- 💬 **Chat RAG** pour interroger la base de connaissances
- 🔐 **Authentification** par utilisateur
- 📊 **Gestion** des entretiens (CRUD, filtres)

## Architecture

```
SmartKnowledge/
├── backend/           # API Flask
│   └── src/
│       ├── app.py           # API REST
│       ├── config.py         # Configuration
│       ├── db/              # Modèles SQLite + ChromaDB
│       ├── auth/            # Authentification
│       ├── transcription/   # Whisper
│       └── rag/            # Query engine
├── frontend/          # Interface web
│   ├── index.html
│   ├── css/style.css
│   └── js/
└── data/              # Données (audio, transcriptions, BDD)
```

## Installation

### Backend

```bash
cd backend

# Créer un environnement virtuel (optionnel)
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Dépendances optionnelles (lourd)
pip install sentence-transformers openai-whisper ollama
```

### Lancer le serveur

```bash
cd backend/src
python3 app.py
```

Le serveur démarre sur `http://localhost:5000`

## Configuration

Voir `backend/src/config.py` pour les options :

- `SECRET_KEY` - Clé secrète Flask
- `SQLITE_PATH` - Chemin base SQLite
- `OLLAMA_MODEL` - Modèle LLM (par défaut: llama2)

## Utilisation

1. Ouvrir `frontend/index.html` dans un navigateur
2. Se connecter avec `root / root`
3. Créer un entretien (enregistrement ou upload)
4. Transcrire et vectoriser
5. Interroger via le chat RAG

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Utilisateur courant |
| GET | /api/entretiens | Liste entretiens |
| POST | /api/entretiens | Créer entretien |
| DELETE | /api/entretiens/<id> | Supprimer |
| POST | /api/entretiens/<id>/transcrire | Transcrire |
| POST | /api/entretiens/<id>/vectoriser | Vectoriser |
| POST | /api/query | Interroger RAG |

## Technologies

- **Backend**: Flask, SQLAlchemy, SQLite
- **Vector Store**: ChromaDB
- **Embeddings**: Sentence Transformers
- **LLM**: Ollama (local)
- **Frontend**: Vanilla JS, CSS (charte Atos)
- **Audio**: Web Audio API, MediaRecorder
