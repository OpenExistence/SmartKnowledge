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
│  - Utilisateur (propriétaire)           │
│  - JSON Métadonnées                     │
└─────────────────────────────────────────┘
```

## Charte Graphique

### Atos Brand (Bleu)

**Couleurs Primaires:**
- Bleu Atos: `#005D6E` (principal)
- Bleu Atos Light: `#00A3A3`
- Bleu Foncé: `#003844`

**Couleurs Secondaires:**
- Blanc: `#FFFFFF`
- Gris Clair: `#F5F5F5`
- Gris: `#666666`
- Noir: `#1A1A1A`

**Accent:**
- Orange: `#FF6B35` (pour les actions importantes)

**Typographie:**
- Font: Arial (system) ou font corporate Atos

### Logo
- Logo Atos à intégrer dans le header

---

## Base de Données Relationnelle (SQLite)

### Table: `utilisateurs`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID unique |
| `username` | TEXT UNIQUE | Nom d'utilisateur |
| `password_hash` | TEXT | Hash du mot de passe |
| `role` | TEXT | `user` ou `admin` |
| `created_at` | DATETIME | Date de création |

### Table: `entretiens`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID unique |
| `utilisateur_id` | INTEGER | Propriétaire (FK utilisateurs) |
| `expert_nom` | TEXT | Nom de l'expert |
| `expert_fonction` | TEXT | Fonction/titre de l'expert |
| `domaine` | TEXT | Domaine (spatial, militaire, énergie, etc.) |
| `date_entretien` | DATETIME | Date et heure de l'entretien |
| `type_fichier` | TEXT | `audio` ou `transcription` |
| `chemin_fichier` | TEXT | Chemin vers l'audio ou la transcription |
| `duree_secondes` | INTEGER | Durée de l'enregistrement |
| `sensibilite` | TEXT | Niveau de sensibilité (voir ci-dessous) |
| `statut_audio` | INTEGER | 0 = non, 1 = oui |
| `statut_transcription` | INTEGER | 0 = non, 1 = oui |
| `statut_vectorisation` | INTEGER | 0 = non, 1 = oui |
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

---

## Base de Données Vectorielle

### Choix Technique
- **Option locale** : ChromaDB (recommandé pour starters)
- **Option cloud** : Pinecone, Weaviate, Qdrant

### Schema des Embeddings

| Champ | Description |
|-------|-------------|
| `id` | ID unique (référence vers entretien SQLite) |
| `texte` | Transcription segmentée |
| `metadata` | Métadonnées (expert, domaine, date, sensibilité, utilisateur_id) |
| `embedding` | Vecteur (dimension selon modèle d'embedding) |

### Modèles d'Embedding

- **Option légère** : `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Option performante** : `sentence-transformers/all-mpnet-base-v2` (768 dimensions)

---

## Interface Web (Frontend)

### Technologies
- **Framework**: Vanilla JS ou框架 léger (Vue.js, React)
- **Style**: CSS avec charte Atos (bleu)
- **Backend API**: Python (Flask/FastAPI)

### Pages/Vues

#### 1. Page de Connexion (`/login`)
- Formulaire: identifiant + mot de passe
- Bouton "Se connecter"
- Lien "Mot de passe oublié" (optionnel)

#### 2. Tableau de Bord (`/dashboard`)
- Welcome message avec le nom de l'utilisateur
- Navigation principale (onglets)
- Accès rapide aux dernières actions

#### 3. Onglet: Nouvel Entretien (`/new`)
Trois options:

**a) Enregistrement Live**
- Bouton "Démarrer l'enregistrement"
- Bouton "Arrêter l'enregistrement"
- Visualisation du temps écoulé
- Prévisualisation audio
- Formulaire: expert nom, fonction, domaine, sensibilité
- Bouton "Sauvegarder"

**b) Déposer un Audio**
- Upload de fichier audio (mp3, wav, m4a)
- Barre de progression
- Formulaire: expert nom, fonction, domaine, sensibilité
- Bouton "Sauvegarder"

**c) Déposer une Transcription**
- Zone de texte pour coller la transcription
- Upload optionnel d'un fichier texte
- Formulaire: expert nom, fonction, domaine, sensibilité
- Bouton "Sauvegarder"

#### 4. Onglet: Gestion des Entretiens (`/manage`)
- Tableau/liste des entretiens
- Filtres: par date, domaine, expert, sensibilité, statut
- Colonnes:
  - Expert | Domaine | Date | Audio | Transcription | Vectorisé
- Actions par entretien:
  - 🔊 Audio → Transcription (lancer transcription Whisper)
  - 📝 Transcription → Audio (TTS - optionnel)
  - 🗑️ Supprimer
  - ✏️ Éditer
- Indicateurs visuels (✅ / ❌ / ⏳)

#### 5. Onglet: Base de Connaissances (`/chat`)
- Interface de chat style conversation
- Zone de saisie de question
- Affichage des réponses avec:
  - Texte de la réponse
  - Citations des sources (expert, date, extrait)
- Optionnel: selector de domaine/expert pour filtrer les sources

### Composants UI

- **Header**: Logo Atos, nom du projet, utilisateur connecté, déconnexion
- **Sidebar/Nav**: Navigation entre les onglets
- **Cards**: Présentation des entretiens
- **Modal**: Confirmations, formulaires détaillés
- **Toast**: Notifications (succès, erreur)

---

## Pipeline de Traitement

### Étape 1: Importation

1. Authentification de l'utilisateur
2. Création de l'entretien dans SQLite (associé à utilisateur_id)
3. Stockage de l'audio dans `data/audio/{utilisateur_id}/`
4. Stockage de la transcription dans `data/transcriptions/{utilisateur_id}/`
5. Génération du fichier JSON de métadonnées

### Étape 2: Transcription

1. Script Whisper (Python)
2. Traitement de l'audio
3. Segmentation du texte par speaker (si possible)
4. Mise à jour du statut dans SQLite
5. Stockage de la transcription

### Étape 3: Vectorisation

1. Chargement de la transcription
2. Segmentation en chunks
3. Génération des embeddings
4. Insertion dans la base vectorielle avec métadonnées (incluant utilisateur_id)
5. Mise à jour du statut dans SQLite

---

## Structure des Fichiers

```
SmartKnowledge/
├── backend/
│   ├── app.py                 # API Flask/FastAPI
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Dépendances Python
│   ├── src/
│   │   ├── db/
│   │   │   ├── sqlite.py      # Gestion SQLite
│   │   │   └── vector.py     # Gestion base vectorielle
│   │   ├── auth/
│   │   │   └── auth.py       # Authentification
│   │   ├── transcription/
│   │   │   └── whisper.py    # Script transcription
│   │   └── rag/
│   │       └── query.py      # Module RAG
│   └── data/
│       ├── audio/
│       │   └── {utilisateur_id}/
│       ├── transcriptions/
│       │   └── {utilisateur_id}/
│       └── db/
│           ├── smartknowledge.sqlite
│           └── vectors/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── css/
│   │   └── style.css         # Charte Atos
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── api.js
│   │   └── components/
│   └── assets/
│       └── logo-atos.png
├── guides/                    # Guides d'entretien par domaine
├── SPEC.md
└── README.md
```

---

## Prochaines Étapes

- [ ] Initialiser le projet Python (backend)
- [ ] Créer la base SQLite avec gestion utilisateurs
- [ ] Implémenter l'authentification
- [ ] Implémenter le script de transcription Whisper
- [ ] Implémenter la base vectorielle
- [ ] Implémenter le pipeline RAG
- [ ] Créer l'API REST
- [ ] Développer le frontend (charte Atos)
- [ ] Créer le compte root (root/root)
