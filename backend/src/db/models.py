"""Database models for SmartKnowledge."""
import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Utilisateur(db.Model):
    """User model."""
    __tablename__ = "utilisateurs"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")  # user or admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Entretien(db.Model):
    """Interview model."""
    __tablename__ = "entretiens"

    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey("utilisateurs.id"), nullable=False)
    expert_nom = db.Column(db.String(200), nullable=False)
    expert_fonction = db.Column(db.String(200))
    domaine = db.Column(db.String(100))  # spatial, militaire, énergie, etc.
    date_entretien = db.Column(db.DateTime)
    type_fichier = db.Column(db.String(20))  # audio or transcription
    chemin_fichier = db.Column(db.String(500))
    duree_secondes = db.Column(db.Integer)
    sensibilite = db.Column(db.String(20), default="public")  # public, interne, confidentiel, secret, tres_secret
    statut_audio = db.Column(db.Integer, default=0)  # 0 = no, 1 = yes
    statut_transcription = db.Column(db.Integer, default=0)
    statut_vectorisation = db.Column(db.Integer, default=0)
    statut = db.Column(db.String(20), default="en_attente")  # en_attente, transcrit, vectorisé
    metadata_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    utilisateur = db.relationship("Utilisateur", backref="entretiens")

    def get_metadata(self):
        """Parse metadata JSON."""
        if self.metadata_json:
            try:
                return json.loads(self.metadata_json)
            except json.JSONDecodeError:
                return {}
        return {}

    def to_dict(self):
        return {
            "id": self.id,
            "utilisateur_id": self.utilisateur_id,
            "expert_nom": self.expert_nom,
            "expert_fonction": self.expert_fonction,
            "domaine": self.domaine,
            "date_entretien": self.date_entretien.isoformat() if self.date_entretien else None,
            "type_fichier": self.type_fichier,
            "chemin_fichier": self.chemin_fichier,
            "duree_secondes": self.duree_secondes,
            "sensibilite": self.sensibilite,
            "statut_audio": bool(self.statut_audio),
            "statut_transcription": bool(self.statut_transcription),
            "statut_vectorisation": bool(self.statut_vectorisation),
            "statut": self.statut,
            "metadata": self.get_metadata(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
