"""Authentication utilities with token support."""
import bcrypt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from flask_login import LoginManager, UserMixin
from src.db.models import Utilisateur

login_manager = LoginManager()

# In-memory token storage (use Redis for production)
# token -> {"user_id": int, "created_at": datetime}
api_tokens = {}


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


def generate_token(user_id: int) -> str:
    """Generate an API token for a user."""
    token = secrets.token_urlsafe(32)
    api_tokens[token] = {
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    return token


def validate_token(token: str) -> int | None:
    """Validate an API token and return user_id."""
    if token in api_tokens:
        token_data = api_tokens[token]
        # Check if token is less than 7 days old
        if datetime.utcnow() - token_data["created_at"] < timedelta(days=7):
            return token_data["user_id"]
        else:
            # Token expired, remove it
            del api_tokens[token]
    return None


def token_required(f):
    """Decorator for API routes that require authentication via token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        
        user_id = validate_token(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Load user and set in g
        user = Utilisateur.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 401
        
        g.user = user
        g.current_user = User(user)
        
        return f(*args, **kwargs)
    
    return decorated


# Alias for compatibility
login_required = token_required
current_user = lambda: getattr(g, 'current_user', None)
