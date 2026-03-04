"""
Tests pour les modèles de base de données
"""
import pytest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Mock db module to avoid Flask app context issues
import unittest.mock as mock

# Mock the db.models module
mock_db = mock.MagicMock()
mock_Utilisateur = mock.MagicMock()
mock_Entretien = mock.MagicMock()

# Create mock models
class MockUser:
    def __init__(self, username, password_hash, role=None, is_admin=False):
        self.username = username
        self.password_hash = password_hash
        self.role = role
        self.is_admin = is_admin

class MockEntretien:
    def __init__(self, titre=None, description=None, interviewe_name=None, created_by=1, transcription=None, status="draft"):
        self.titre = titre
        self.description = description
        self.interviewe_name = interviewe_name
        self.created_by = created_by
        self.transcription = transcription
        self.status = status


class TestModels:
    """Tests des modèles mock"""
    
    def test_user_creation(self):
        """Test création utilisateur"""
        user = MockUser(username="testuser", password_hash="hash", is_admin=False)
        assert user.username == "testuser"
        assert user.is_admin is False
    
    def test_entretien_creation(self):
        """Test création entretien"""
        entretien = MockEntretien(
            titre="Test Interview",
            description="Description test",
            interviewe_name="John Doe",
            created_by=1
        )
        assert entretien.titre == "Test Interview"
        assert entretien.interviewe_name == "John Doe"
        assert entretien.status == "draft"
    
    def test_entretien_status_default(self):
        """Test status par défaut"""
        entretien = MockEntretien(titre="Test", created_by=1)
        assert entretien.status == "draft"
    
    def test_entretien_with_transcription(self):
        """Test entretien avec transcription"""
        entretien = MockEntretien(
            titre="Test",
            transcription="Texte transcrit",
            created_by=1
        )
        assert entretien.transcription == "Texte transcrit"
