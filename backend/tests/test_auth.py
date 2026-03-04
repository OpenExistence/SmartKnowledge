"""
Tests pour l'authentification
"""
import pytest
import sys
import os

# Test password functions directly without Flask dependencies
import bcrypt


def hash_password(password: str) -> str:
    """Hash a password."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


class TestAuth:
    """Tests d'authentification"""
    
    def test_password_hashing(self):
        """Test hashage mot de passe"""
        password = "testpassword123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 0
    
    def test_password_verification_correct(self):
        """Test vérification mot de passe correct"""
        password = "testpassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_password_verification_incorrect(self):
        """Test vérification mot de passe incorrect"""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Test que le sel produit des hashes différents"""
        password = "testpassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # With salt, hashes should be different
        assert hash1 != hash2
    
    def test_empty_password(self):
        """Test avec mot de passe vide"""
        password = ""
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
        assert verify_password("wrong", hashed) is False
    
    def test_long_password(self):
        """Test avec mot de passe long (bcrypt limite à 72 bytes)"""
        password = "a" * 72  # bcrypt max
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
        
        # Test that longer passwords fail
        with pytest.raises(ValueError):
            hash_password("a" * 73)
