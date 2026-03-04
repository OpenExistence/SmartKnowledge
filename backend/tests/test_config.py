"""
Tests pour la configuration
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import config


class TestConfig:
    """Tests de configuration"""
    
    def test_config_has_required_keys(self):
        """Test clés requises"""
        required_attrs = [
            'SECRET_KEY',
            'SQLITE_PATH',
            'CHROMA_PATH',
            'OLLAMA_BASE_URL',
            'OLLAMA_MODEL',
            'MAX_CONTENT_LENGTH'
        ]
        
        for attr in required_attrs:
            assert hasattr(config, attr), f"Missing attribute: {attr}"
    
    def test_ollama_defaults(self):
        """Test valeurs Ollama par défaut"""
        assert config.OLLAMA_BASE_URL == "http://localhost:11434"
        assert "llama" in config.OLLAMA_MODEL.lower() or "minimax" in config.OLLAMA_MODEL.lower()
    
    def test_directories_exist(self):
        """Test création des répertoires"""
        assert os.path.exists(config.DATA_DIR)
        assert os.path.exists(config.AUDIO_DIR)
        assert os.path.exists(config.TRANSCRIPTIONS_DIR)
        assert os.path.exists(config.DB_DIR)
        assert os.path.exists(config.VECTORS_DIR)
