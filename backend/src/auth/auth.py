"""Authentication utilities."""
import bcrypt
from flask_login import LoginManager, UserMixin
from src.db.models import Utilisateur

login_manager = LoginManager()


def init_auth(app):
    """Initialize Flask-Login."""
    login_manager.init_app(app)
    login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    return Utilisateur.query.get(int(user_id))


class User(UserMixin):
    """User wrapper for Flask-Login."""

    def __init__(self, utilisateur):
        self.utilisateur = utilisateur
        self.id = utilisateur.id
        self.username = utilisateur.username
        self.role = utilisateur.role

    def get_id(self):
        return str(self.id)

    def is_admin(self):
        return self.role == "admin"


def hash_password(password: str) -> str:
    """Hash a password."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def authenticate_user(username: str, password: str) -> Utilisateur | None:
    """Authenticate a user."""
    user = Utilisateur.query.filter_by(username=username).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None
