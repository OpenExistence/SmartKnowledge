# SmartKnowledge

Outil de capture et valorisation des connaissances expertes pour préserver et diffuser le savoir des seniors vers les nouveaux embauchés.

## Fonctionnalités

- 🎙️ **Enregistrement audio** d'entretiens
- 📝 **Transcription** automatique avec Whisper
- 🔍 **Vectorisation** pour recherche sémantique
- 💬 **Chat RAG** pour interroger la base de connaissances
- 🔐 **Authentification** par utilisateur
- 👥 **Gestion utilisateurs** (admin/user)
- 📊 **Gestion** des entretiens (CRUD, filtres)

## Installation

### Clone du projet

```bash
git clone https://github.com/OpenExistence/SmartKnowledge.git
cd SmartKnowledge
```

### Configuration automatique

```bash
# Rendre les scripts exécutables
chmod +x setup.sh run.sh

# Lancer l'installation
./setup.sh
```

Le script `setup.sh` va :
1. Créer un environnement virtuel Python (`backend/venv`)
2. Installer les dépendances core (Flask, ChromaDB, etc.)
3. Demander si tu veux installer les dépendances optionnelles (Whisper, Sentence Transformers) - nécessite ~2GB

### Lancer l'application

```bash
./run.sh
```

L'application démarre sur `http://localhost:5000`

### Identifiants par défaut

- **Login** : `root`
- **Mot de passe** : `root`

## Structure

```
SmartKnowledge/
├── setup.sh              # Script d'installation
├── run.sh                # Script de lancement
├── README.md
├── SPEC.md               # Spécifications techniques
│
├── backend/              # API Flask
│   ├── requirements.txt  # Dépendances Python
│   ├── src/
│   │   ├── app.py           # API REST
│   │   ├── config.py        # Configuration
│   │   ├── db/              # Modèles SQLite + ChromaDB
│   │   ├── auth/           # Authentification
│   │   ├── transcription/  # Whisper
│   │   └── rag/           # Query engine
│   └── data/             # Données locales (audio, transcriptions, BDD)
│
└── frontend/             # Interface web
    ├── index.html
    ├── css/style.css
    └── js/
```

## Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SECRET_KEY` | Clé secrète Flask | `dev-secret-key-change-in-production` |
| `FLASK_HOST` | Hôte du serveur | `0.0.0.0` |
| `FLASK_PORT` | Port du serveur | `5000` |
| `OLLAMA_BASE_URL` | URL Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modèle LLM | `llama2` |

Créer un fichier `.env` dans `backend/src/` si besoin.

### Dépendances optionnelles

Pour avoir la transcription automatique et le chat RAG :

```bash
cd backend
source venv/bin/activate
pip install openai-whisper sentence-transformers ollama
```

Cela nécessite ~2GB d'espace disque.

## Utilisation

1. Ouvrir `frontend/index.html` dans un navigateur (ou accéder au serveur)
2. Se connecter avec `root / root`
3. **Créer un entretien** :
   - Enregistrement live avec le micro
   - Upload d'un fichier audio
   - Dépôt d'une transcription texte
4. **Transcrire** : Cliquer sur 🎙️ sur un entretien
5. **Vectoriser** : Cliquer sur 🔍 pour indexer dans la base
6. **Interroger** : Aller dans "Base de Connaissances" pour poser des questions

### En tant qu'admin

Le compte `root` est admin. Il peut :
- Voir tous les entretiens
- Gérer les utilisateurs (onglet Administration)

Créer un nouvel admin :
```python
# Via l'API ou directement en base
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Utilisateur courant |
| GET | /api/entretiens | Liste entretiens |
| POST | /api/entretiens | Créer entretien |
| DELETE | /api/entretiens/<id> | Supprimer |
| POST | /api/entretiens/<id>/transcrire | Transcrire (Whisper) |
| POST | /api/entretiens/<id>/vectoriser | Vectoriser |
| POST | /api/query | Interroger RAG |
| GET | /api/users | Liste utilisateurs (admin) |
| POST | /api/users | Créer utilisateur (admin) |

## Technologies

- **Backend**: Flask, SQLAlchemy, SQLite
- **Vector Store**: ChromaDB
- **Embeddings**: Sentence Transformers
- **LLM**: Ollama (local)
- **Frontend**: Vanilla JS, CSS (charte Atos)
- **Audio**: Web Audio API, MediaRecorder

## Dépannage

### "python3-venv not found"
```bash
sudo apt install python3.12-venv
```

### Erreur d'import (whisper/sentence-transformers non installés)
Ces dépendances sont optionnelles. L'API retournera une erreur explicative.
Pour les installer : `pip install openai-whisper sentence-transformers`

### Port 5000 déjà utilisé
Modifier `FLASK_PORT` dans `.env` ou `config.py`
