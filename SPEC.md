# SmartKnowledge - Spécifications du Projet

## Vision

Outil de capture et valorisation des connaissances expertes (spatial, militaire, énergie, etc.) pour préserver et diffuser le savoir des seniors vers les nouveaux embauchés.

## Architecture Globale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Entretien      │───▶│  Transcription  │───▶│  Vector Store   │
│  (Audio)        │    │  (Texte)        │    │  (Embeddings)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│           SQLite (Métadonnées)          │
│  - Audio/Transcript                     │
│  - Date, Nom, Sensibilité              │
│  - JSON Métadonnées                     │
└─────────────────────────────────────────┘
```

## Base de Données Relationnelle (SQLite)

### Table: `entretiens`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID unique |
| `expert_nom` | TEXT | Nom de l'expert |
| `expert_fonction` | TEXT | Fonction/titre de l'expert |
| `domaine` | TEXT | Domaine (spatial, militaire, énergie, etc.) |
| `date_entretien` | DATETIME | Date et heure de l'entretien |
| `type_fichier` | TEXT | `audio` ou `transcription` |
| `chemin_fichier` | TEXT | Chemin vers l'audio ou la transcription |
| `duree_secondes` | INTEGER | Durée de l'enregistrement |
| `sensibilite` | TEXT | Niveau de sensibilité (voir ci-dessous) |
| `statut` | TEXT | `en_attente`, `transcrit`, `vectorisé` |
| `metadata_json` | TEXT | JSON avec métadonnées additionnelles |
| `created_at` | DATETIME | Date de création de l'enregistrement |
| `updated_at` | DATETIME | Date de mise à jour |

### Niveaux de Sensibilité

| Niveau | Description |
|--------|-------------|
| `public` | Aucune restriction |
| `interne` | Interne à l'entreprise |
| `confidentiel` | Données confidentielles |
| `secret` | Données secrètes |
| `tres_secret` | Données très secrètes |

### Métadonnées JSON (champ `metadata_json`)

```json
{
  "interviewer": "Nom de l'interviewer",
  "lieu": "Lieu de l'entretien",
  "tags": ["tag1", "tag2"],
  "notes": "Notes diverses",
  "themes_abordes": ["theme1", "theme2"],
  "references": ["document1.pdf", "lien1"]
}
```

## Base de Données Vectorielle

### Choix Technique
- **Option locale** : ChromaDB (recommandé pour starters)
- **Option cloud** : Pinecone, Weaviate, Qdrant

### Schema des Embeddings

| Champ | Description |
|-------|-------------|
| `id` | ID unique (référence vers entretien SQLite) |
| `texte` | Transcription segmentée |
| `metadata` | Métadonnées (expert, domaine, date, sensibilité) |
| `embedding` | Vecteur (dimension selon modèle d'embedding) |

### Modèles d'Embedding

- **Option légère** : `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Option performante** : `sentence-transformers/all-mpnet-base-v2` (768 dimensions)

## Pipeline de Traitement

### Étape 1: Importation

1. Création de l'entretien dans SQLite
2. Stockage de l'audio dans `data/audio/`
3. Génération du fichier JSON de métadonnées

### Étape 2: Transcription

1. Utilisation de **Whisper** (OpenAI) pour la transcription
2. Segmentation du texte par speaker (si possible)
3. Mise à jour du statut dans SQLite
4. Stockage de la transcription dans `data/transcriptions/`

### Étape 3: Vectorisation

1. Chargement de la transcription
2. Segmentation en chunks (paragraphes ou sentences)
3. Génération des embeddings
4. Insertion dans la base vectorielle avec métadonnées
5. Mise à jour du statut dans SQLite

## Interface de Requête (RAG)

### Flux

1. Question utilisateur en langage naturel
2. Génération de l'embedding de la question
3. Recherche dans la base vectorielle (top-k résultats)
4. Construction du contexte (chunks + métadonnées)
5. Interrogation du LLM avec le contexte
6. Retour de la réponse + citations

### Modèles LLM Supportés

- Ollama (local)
- OpenAI (API)
- Anthropic (API)

## Fonctionnalités Principales

### 1. Entretiens Guidés
- Interface de conduite d'entretiens avec des experts
- Questions pré-définies par domaine (spatial, militaire, énergie, etc.)
- Possibilité de personnaliser les guides d'entretien
- Enregistrement audio des sessions

### 2. Transcription
- Transcription automatique de l'audio via **Whisper** (Python)
- Identification du speaker (expert vs interviewer) - optionnel
- Validation/relecture humaine avant vectorisation

### 3. Base de Connaissances Vectorielle
- Embedding des transcriptions
- Stockage dans une base de données vectorielle
- Indexation par domaine, expert, date, thématiques, sensibilité

### 4. Interrogation via LLM
- Interface de requête en langage naturel
- Le LLM interroge la base vectorielle pour générer des réponses
- Citations des sources (expert, date, contexte)

## Domaines Cibles

- Spatial
- Militaire
- Énergie
- (À compléter)

## Structure des Fichiers

```
SmartKnowledge/
├── data/
│   ├── audio/              # Fichiers audio bruts
│   ├── transcriptions/    # Fichiers texte transcrits
│   └── db/
│       ├── smartknowledge.sqlite  # Base SQLite
│       └── vectors/       # Base vectorielle (ChromaDB)
├── src/
│   ├── cli.py             # Interface CLI
│   ├── db/
│   │   ├── sqlite.py      # Gestion SQLite
│   │   └── vector.py      # Gestion base vectorielle
│   ├── transcription/
│   │   └── whisper.py     # Script transcription
│   └── rag/
│       └── query.py       # Module RAG
├── guides/                # Guides d'entretien par domaine
├── SPEC.md
└── README.md
```

## Prochaines Étapes

- [ ] Valider la stack technique
- [ ] Initialiser le projet Python
- [ ] Implémenter la base SQLite
- [ ] Implémenter le script de transcription Whisper
- [ ] Implémenter la base vectorielle
- [ ] Implémenter le pipeline RAG
- [ ] Créer l'interface CLI
