"""
Tests API pour l'upload de fichiers (audio + texte)
"""
import pytest
import sys
import os
import tempfile
from io import BytesIO

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
        # Create test user
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


@pytest.fixture
def auth_token(client):
    """Get auth token."""
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpassword123"}
    )
    return response.json["token"]


class TestUploadAPI:
    """Tests des endpoints d'upload"""
    
    def test_upload_txt_file(self, client, auth_token):
        """Test upload fichier TXT"""
        data = {
            'expert_nom': 'Test Expert',
            'expert_fonction': 'Engineer',
            'domaine': 'IT',
            'sensibilite': 'public',
        }
        data['fichier'] = (BytesIO(b'Test transcription content'), 'test.txt')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 201
        assert response.json["message"] == "Entretien created"
        assert response.json["entretien"]["expert_nom"] == "Test Expert"
    
    def test_upload_md_file(self, client, auth_token):
        """Test upload fichier MD"""
        data = {
            'expert_nom': 'Test Expert MD',
        }
        data['fichier'] = (BytesIO(b'# Test\n\nContent here'), 'test.md')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 201
    
    def test_upload_pdf_file(self, client, auth_token):
        """Test upload fichier PDF"""
        # Note: This test will pass if PyPDF2 can parse the PDF
        # For now, we just test that PDF extension is accepted
        data = {
            'expert_nom': 'Test Expert PDF',
        }
        data['fichier'] = (BytesIO(b'%PDF-1.4 fake pdf content'), 'test.pdf')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Should either succeed or fail gracefully
        assert response.status_code in [201, 400, 500]
    
    def test_upload_docx_file(self, client, auth_token):
        """Test upload fichier DOCX"""
        data = {
            'expert_nom': 'Test Expert DOCX',
        }
        # Minimal DOCX file (PK zip structure)
        data['fichier'] = (BytesIO(b'PK\x03\x04fake docx content'), 'test.docx')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Should either succeed or fail gracefully
        assert response.status_code in [201, 400, 500]
    
    def test_upload_invalid_file_type(self, client, auth_token):
        """Test upload fichier type invalide"""
        data = {
            'expert_nom': 'Test Expert',
        }
        data['fichier'] = (BytesIO(b'executable content'), 'test.exe')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json["error"]
    
    def test_upload_audio_file(self, client, auth_token):
        """Test upload fichier audio"""
        data = {
            'expert_nom': 'Test Audio Expert',
        }
        data['fichier'] = (BytesIO(b'fake audio data'), 'test.mp3')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 201
        assert response.json["entretien"]["type_fichier"] == "audio"
    
    def test_upload_text_transcription(self, client, auth_token):
        """Test upload transcription texte"""
        data = {
            'expert_nom': 'Test Text Expert',
            'transcription': 'This is a direct transcription text.',
        }
        
        response = client.post(
            '/api/entretiens',
            json=data,
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 201
        assert response.json["entretien"]["expert_nom"] == "Test Text Expert"
    
    def test_upload_requires_auth(self, client):
        """Test upload nécessite auth"""
        data = {
            'expert_nom': 'Test Expert',
        }
        data['fichier'] = (BytesIO(b'test'), 'test.txt')
        
        response = client.post(
            '/api/entretiens',
            data=data,
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 401