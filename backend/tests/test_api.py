"""
Tests API pour SmartKnowledge
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.app import create_app
from src.db.models import db, Utilisateur


@pytest.fixture
def app():
    """Create application for testing."""
    import bcrypt
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    
    with app.app_context():
        db.create_all()
        # Create test user with proper password hash
        test_password = "testpassword123"
        password_hash = bcrypt.hashpw(test_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user = Utilisateur(
            username="testuser",
            password_hash=password_hash,
            role="admin"
        )
        db.session.add(user)
        db.session.commit()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


class TestAuthAPI:
    """Tests des endpoints d'authentification"""
    
    def test_health_check(self, client):
        """Test health check"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json["status"] == "ok"
    
    def test_login_success(self, client):
        """Test login avec succès"""
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "testpassword123"}
        )
        assert response.status_code == 200
        assert "token" in response.json
    
    def test_login_missing_credentials(self, client):
        """Test login sans identifiants"""
        response = client.post("/api/auth/login", json={})
        assert response.status_code == 400
    
    def test_me_requires_auth(self, client):
        """Test /api/auth/me nécessite une authentification"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401


class TestEntretienAPI:
    """Tests des endpoints entretiens"""
    
    def test_list_entretiens_requires_auth(self, client):
        """Test liste entretiens nécessite auth"""
        response = client.get("/api/entretiens")
        assert response.status_code == 401
    
    def test_create_entretien_requires_auth(self, client):
        """Test création entretien nécessite auth"""
        response = client.post(
            "/api/entretiens",
            json={"expert_nom": "Test Expert"}
        )
        assert response.status_code == 401


class TestRAGAPI:
    """Tests des endpoints RAG"""
    
    def test_query_requires_auth(self, client):
        """Test query nécessite auth"""
        response = client.post(
            "/api/query",
            json={"question": "test question"}
        )
        assert response.status_code == 401


class TestErrorHandling:
    """Tests des erreurs"""
    
    def test_invalid_json(self, client):
        """Test JSON invalide"""
        response = client.post(
            "/api/auth/login",
            data="invalid json",
            content_type="application/json"
        )
        assert response.status_code == 400
    
    def test_nonexistent_endpoint(self, client):
        """Test endpoint inexistant"""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404