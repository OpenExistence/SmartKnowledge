# SmartKnowledge - Spécifications du Projet

## Vision

Outil de capture et valorisation des connaissances expertes (spatial, militaire, énergie, etc.) pour préserver et diffuser le savoir des seniors vers les nouveaux embauchés.

## Fonctionnalités Principales

### 1. Entretiens Guidés
- Interface de conduite d'entretiens avec des experts
- Questions pré-définies par domaine (spatial, militaire, énergie, etc.)
- Possibilité de personnaliser les guides d'entretien
- Enregistrement audio des sessions

### 2. Transcription
- Transcription automatique de l'audio en texte
- Identification du speaker (expert vs interviewer)
- Validation/relecture humaine avant stockage

### 3. Base de Connaissances Vectorielle
- Embedding des transcriptions
- Stockage dans une base de données vectorielle (Chroma, Pinecone, Weaviate, etc.)
- Indexation par domaine, expert, date, thématiques

### 4. Interrogation via LLM
- Interface de requête en langage naturel
- Le LLM interroge la base vectorielle pour générer des réponses
- Citations des sources (expert, date, contexte)

## Architecture Type

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Entretien      │───▶│  Transcription  │───▶│  Vector Store   │
│  (Audio)        │    │  (Texte)        │    │  (Embeddings)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                         ┌─────────────────┐    ┌─────────────────┐
                         │  Interface      │◀───│  LLM            │
                         │  Utilisateur     │    │  (RAG)          │
                         └─────────────────┘    └─────────────────┘
```

## Domaines Cibles

- Spatial
- Militaire
- Énergie
- (À compléter)

## Prochaines Étapes

- [ ] Définir la stack technique
- [ ] Choix de la base vectorielle
- [ ] Conception de l'interface d'entretien
- [ ] Pipeline de transcription
- [ ] Implémentation RAG
