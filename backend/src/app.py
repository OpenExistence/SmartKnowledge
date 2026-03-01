"""Main Flask application."""
import os
from pathlib import Path
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename

import src.config as config
from src.db.models import db, Utilisateur, Entretien
from src.db import init_db
from src.auth.auth import init_auth, authenticate_user, User


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{config.SQLITE_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    init_auth(app)

    # Initialize database
    init_db(app)

    # Register routes
    register_routes(app)

    return app


def register_routes(app):
    """Register all routes."""

    @app.route("/api/health")
    def health():
        """Health check."""
        return jsonify({"status": "ok"})

    # Auth routes
    @app.route("/api/auth/login", methods=["POST"])
    def login():
        """Login endpoint."""
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        user = authenticate_user(username, password)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        user_obj = User(user)
        login_user(user_obj)
        return jsonify({"message": "Login successful", "user": user.to_dict()})

    @app.route("/api/auth/logout", methods=["POST"])
    @login_required
    def logout():
        """Logout endpoint."""
        logout_user()
        return jsonify({"message": "Logout successful"})

    @app.route("/api/auth/me", methods=["GET"])
    @login_required
    def me():
        """Get current user."""
        return jsonify({"user": current_user.utilisateur.to_dict()})

    # Entretien routes
    @app.route("/api/entretiens", methods=["GET"])
    @login_required
    def list_entretiens():
        """List all entretiens for current user."""
        entretiens = Entretien.query.filter_by(
            utilisateur_id=current_user.id
        ).order_by(Entretien.created_at.desc()).all()
        return jsonify({"entretiens": [e.to_dict() for e in entretiens]})

    @app.route("/api/entretiens/<int:entretien_id>", methods=["GET"])
    @login_required
    def get_entretien(entretien_id):
        """Get a single entretien."""
        entretien = Entretien.query.filter_by(
            id=entretien_id,
            utilisateur_id=current_user.id
        ).first()

        if not entretien:
            return jsonify({"error": "Entretien not found"}), 404

        return jsonify({"entretien": entretien.to_dict()})

    @app.route("/api/entretiens", methods=["POST"])
    @login_required
    def create_entretien():
        """Create a new entretien."""
        # Handle file upload or text data
        expert_nom = request.form.get("expert_nom") or (request.json or {}).get("expert_nom")
        expert_fonction = request.form.get("expert_fonction") or (request.json or {}).get("expert_fonction")
        domaine = request.form.get("domaine") or (request.json or {}).get("domaine")
        sensibilite = request.form.get("sensibilite") or (request.json or {}).get("sensibilite", "public")
        metadata_json = request.form.get("metadata") or (request.json or {}).get("metadata")

        if not expert_nom:
            return jsonify({"error": "expert_nom is required"}), 400

        # Handle file upload
        fichier = request.files.get("fichier")
        type_fichier = None
        chemin_fichier = None
        duree_secondes = None

        if fichier:
            filename = secure_filename(fichier.filename)
            ext = Path(filename).suffix.lower()

            if ext not in config.ALLOWED_AUDIO_EXTENSIONS:
                return jsonify({"error": "Invalid audio file type"}), 400

            # Save file
            user_dir = config.AUDIO_DIR / str(current_user.id)
            user_dir.mkdir(parents=True, exist_ok=True)
            filepath = user_dir / filename
            fichier.save(filepath)

            type_fichier = "audio"
            chemin_fichier = str(filepath)

        # Handle text transcription
        transcription = request.form.get("transcription") or (request.json or {}).get("transcription")
        if transcription:
            type_fichier = "transcription"
            user_dir = config.TRANSCRIPTIONS_DIR / str(current_user.id)
            user_dir.mkdir(parents=True, exist_ok=True)
            filename = f"{expert_nom}_{len(list(user_dir.glob('*')))}.txt"
            filepath = user_dir / filename
            filepath.write_text(transcription)
            chemin_fichier = str(filepath)

        # Create entretien
        entretien = Entretien(
            utilisateur_id=current_user.id,
            expert_nom=expert_nom,
            expert_fonction=expert_fonction,
            domaine=domaine,
            type_fichier=type_fichier,
            chemin_fichier=chemin_fichier,
            duree_secondes=duree_secondes,
            sensibilite=sensibilite,
            statut_audio=1 if type_fichier == "audio" else 0,
            statut_transcription=1 if type_fichier == "transcription" else 0,
            metadata_json=str(metadata_json) if metadata_json else None,
            statut="en_attente"
        )

        db.session.add(entretien)
        db.session.commit()

        return jsonify({"message": "Entretien created", "entretien": entretien.to_dict()}), 201

    @app.route("/api/entretiens/<int:entretien_id>", methods=["DELETE"])
    @login_required
    def delete_entretien(entretien_id):
        """Delete an entretien."""
        entretien = Entretien.query.filter_by(
            id=entretien_id,
            utilisateur_id=current_user.id
        ).first()

        if not entretien:
            return jsonify({"error": "Entretien not found"}), 404

        # Delete file if exists
        if entretien.chemin_fichier and os.path.exists(entretien.chemin_fichier):
            os.remove(entretien.chemin_fichier)

        db.session.delete(entretien)
        db.session.commit()

        return jsonify({"message": "Entretien deleted"})

    @app.route("/api/entretiens/<int:entretien_id>/transcrire", methods=["POST"])
    @login_required
    def transcrire_entretien(entretien_id):
        """Transcribe an audio file (placeholder - requires whisper)."""
        entretien = Entretien.query.filter_by(
            id=entretien_id,
            utilisateur_id=current_user.id
        ).first()

        if not entretien:
            return jsonify({"error": "Entretien not found"}), 404

        if entretien.type_fichier != "audio":
            return jsonify({"error": "Not an audio file"}), 400

        # Placeholder - whisper not installed
        return jsonify({
            "error": "Transcription requires whisper. Install: pip install openai-whisper"
        }), 501

    @app.route("/api/entretiens/<int:entretien_id>/vectoriser", methods=["POST"])
    @login_required
    def vectoriser_entretien(entretien_id):
        """Vectorize a transcription (placeholder - requires sentence-transformers)."""
        entretien = Entretien.query.filter_by(
            id=entretien_id,
            utilisateur_id=current_user.id
        ).first()

        if not entretien:
            return jsonify({"error": "Entretien not found"}), 404

        if not entretien.statut_transcription:
            return jsonify({"error": "Transcription not available"}), 400

        # Placeholder - sentence-transformers not installed
        return jsonify({
            "error": "Vectorization requires sentence-transformers. Install: pip install sentence-transformers"
        }), 501


# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=True
    )
