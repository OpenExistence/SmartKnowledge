"""
Tests pour le parsing de fichiers texte (PDF, DOCX, TXT)
"""
import pytest
import sys
import os
import tempfile
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.text_parser import TextParser


class TestTextParser:
    """Tests du parser de fichiers texte"""
    
    def test_is_supported_txt(self):
        """Test support .txt"""
        assert TextParser.is_supported("test.txt") is True
    
    def test_is_supported_md(self):
        """Test support .md"""
        assert TextParser.is_supported("test.md") is True
    
    def test_is_supported_pdf(self):
        """Test support .pdf"""
        assert TextParser.is_supported("test.pdf") is True
    
    def test_is_supported_docx(self):
        """Test support .docx"""
        assert TextParser.is_supported("test.docx") is True
    
    def test_is_not_supported(self):
        """Test non-support .exe"""
        assert TextParser.is_supported("test.exe") is False
    
    def test_get_supported_extensions(self):
        """Test liste extensions supportées"""
        exts = TextParser.get_supported_extensions()
        assert 'txt' in exts
        assert 'md' in exts
        assert 'pdf' in exts
        assert 'docx' in exts
    
    def test_parse_txt_file(self):
        """Test parsing fichier TXT"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write("Hello, this is a test transcription.\nSecond line.")
            temp_path = f.name
        
        try:
            content = TextParser.parse_file(temp_path)
            assert "Hello, this is a test transcription" in content
            assert "Second line" in content
        finally:
            os.unlink(temp_path)
    
    def test_parse_txt_file_special_chars(self):
        """Test parsing TXT avec caractères spéciaux"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write("Émoji: 🎉\nAccents: éèê\nUTF-8: 日本語")
            temp_path = f.name
        
        try:
            content = TextParser.parse_file(temp_path)
            assert "Émoji" in content
            assert "Accents" in content
        finally:
            os.unlink(temp_path)
    
    def test_parse_md_file(self):
        """Test parsing fichier MD"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("# Title\n\n## Section\n\nSome content here.")
            temp_path = f.name
        
        try:
            content = TextParser.parse_file(temp_path)
            assert "Title" in content
            assert "Section" in content
        finally:
            os.unlink(temp_path)


class TestTextParserPDF:
    """Tests spécifiques PDF (si PyPDF2 disponible)"""
    
    def test_pdf_not_available_error(self):
        """Test erreur si PyPDF2 non installé"""
        # This test just checks the module loads correctly
        # PyPDF2 availability is checked at import time
        from src.text_parser import PDF_AVAILABLE
        # PDF_AVAILABLE should be True since we installed pypdf2
        assert PDF_AVAILABLE is True


class TestTextParserDOCX:
    """Tests spécifiques DOCX (si python-docx disponible)"""
    
    def test_docx_available(self):
        """Test que DOCX est disponible"""
        from src.text_parser import DOCX_AVAILABLE
        assert DOCX_AVAILABLE is True