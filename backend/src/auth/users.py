"""User management routes."""
from flask import request, jsonify
from flask_login import login_required, current_user
from src.db.models import db, Utilisateur
from src.auth.auth import hash_password


def register_user_routes(app):
    """Register user management routes."""

    @app.route("/api/users", methods=["GET"])
    @login_required
    def list_users():
        """List all users (admin only)."""
        if not current_user.is_admin():
            return jsonify({"error": "Admin only"}), 403

        users = Utilisateur.query.all()
        return jsonify({"users": [u.to_dict() for u in users]})

    @app.route("/api/users", methods=["POST"])
    @login_required
    def create_user():
        """Create a new user (admin only)."""
        if not current_user.is_admin():
            return jsonify({"error": "Admin only"}), 403

        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "user")

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        if Utilisateur.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400

        user = Utilisateur(
            username=username,
            password_hash=hash_password(password),
            role=role
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User created", "user": user.to_dict()}), 201

    @app.route("/api/users/<int:user_id>", methods=["PUT"])
    @login_required
    def update_user(user_id):
        """Update a user."""
        # Users can update themselves, admins can update anyone
        if current_user.id != user_id and not current_user.is_admin():
            return jsonify({"error": "Permission denied"}), 403

        user = Utilisateur.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()

        if "password" in data:
            user.password_hash = hash_password(data["password"])

        if "role" in data and current_user.is_admin():
            user.role = data["role"]

        db.session.commit()

        return jsonify({"message": "User updated", "user": user.to_dict()})

    @app.route("/api/users/<int:user_id>", methods=["DELETE"])
    @login_required
    def delete_user(user_id):
        """Delete a user (admin only)."""
        if not current_user.is_admin():
            return jsonify({"error": "Admin only"}), 403

        if current_user.id == user_id:
            return jsonify({"error": "Cannot delete yourself"}), 400

        user = Utilisateur.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted"})
