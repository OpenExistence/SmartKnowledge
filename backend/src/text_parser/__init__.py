"""Text file parser for PDF, DOCX and TXT files."""
import os
from pathlib import Path
from typing import Optional

# Try importing libraries, they may not be available
DOCX_AVAILABLE = False
PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    pass

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    pass


class TextParser:
    """Parse text from various file formats."""
    
    @staticmethod
    def parse_file(file_path: str) -> Optional[str]:
        """Parse a text file and return its content.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text content or None if parsing failed
        """
        ext = Path(file_path).suffix.lower()
        
        if ext in ['.txt', '.md']:
            return TextParser._parse_txt(file_path)
        elif ext == '.docx':
            return TextParser._parse_docx(file_path)
        elif ext == '.pdf':
            return TextParser._parse_pdf(file_path)
        
        return None
    
    @staticmethod
    def _parse_txt(file_path: str) -> str:
        """Parse plain text file."""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    
    @staticmethod
    def _parse_docx(file_path: str) -> Optional[str]:
        """Parse DOCX file."""
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx is required for DOCX files")
        
        doc = Document(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        
        # Also extract tables
        for table in doc.tables:
            for row in table.rows:
                row_text = ' | '.join(cell.text for cell in row.cells)
                if row_text.strip():
                    paragraphs.append(row_text)
        
        return '\n\n'.join(paragraphs)
    
    @staticmethod
    def _parse_pdf(file_path: str) -> Optional[str]:
        """Parse PDF file."""
        if not PDF_AVAILABLE:
            raise ImportError("PyPDF2 is required for PDF files")
        
        text_parts = []
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        return '\n\n'.join(text_parts)
    
    @staticmethod
    def is_supported(file_path: str) -> bool:
        """Check if a file format is supported."""
        ext = Path(file_path).suffix.lower()
        return ext in ['.txt', '.md', '.docx', '.pdf']
    
    @staticmethod
    def get_supported_extensions() -> set:
        """Get list of supported file extensions."""
        return {'txt', 'md', 'docx', 'pdf'}