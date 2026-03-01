"""Database initialization and utilities."""
import bcrypt
from src.db.models import db, Utilisateur


def init_db(app):
    """Initialize database with app context."""
    with app.app_context():
        db.create_all()
        create_default_users(app)


def create_default_users(app):
    """Create default root user if not exists."""
    with app.app_context():
        root = Utilisateur.query.filter_by(username="root").first()
        if not root:
            password_hash = bcrypt.hashpw("root".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            root = Utilisateur(
                username="root",
                password_hash=password_hash,
                role="admin"
            )
            db.session.add(root)
            db.session.commit()
            print("Created default user: root/root")
        else:
            print("Default user already exists")


def reset_database(app):
    """Reset database (drop all tables)."""
    with app.app_context():
        db.drop_all()
        db.create_all()
        create_default_users(app)
