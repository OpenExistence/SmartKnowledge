#!/bin/bash
# SmartKnowledge Setup Script
# Usage: ./setup.sh

set -e

echo "🚀 SmartKnowledge - Installation"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

echo "Python version: $(python3 --version)"

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing core dependencies..."
pip install -r requirements.txt

# Check what's actually installed
echo ""
echo "Checking installed packages..."

# Check for Ollama
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama CLI found${NC}"
    echo "  To use RAG, make sure Ollama is running: ollama serve"
else
    echo -e "${YELLOW}⚠ Ollama CLI not found${NC}"
    echo "  Install from: https://github.com/ollama/ollama"
    echo "  Or: curl -fsSL https://ollama.ai/install.sh | sh"
fi

# Check for sentence-transformers
if python3 -c "import sentence_transformers" 2>/dev/null; then
    echo -e "${GREEN}✓ sentence-transformers installed${NC}"
else
    echo -e "${YELLOW}⚠ sentence-transformers not installed${NC}"
fi

# Check for faster-whisper
if python3 -c "import faster_whisper" 2>/dev/null; then
    echo -e "${GREEN}✓ faster-whisper installed${NC}"
else
    echo -e "${YELLOW}⚠ faster-whisper not installed${NC}"
fi

# Check for ollama Python package
if python3 -c "import ollama" 2>/dev/null; then
    echo -e "${GREEN}✓ ollama Python package installed${NC}"
else
    echo -e "${YELLOW}⚠ ollama Python package not installed${NC}"
fi

# Go back to project root
cd ..

# Create data directories
echo "Creating data directories..."
mkdir -p backend/data/audio
mkdir -p backend/data/transcriptions
mkdir -p backend/data/db/vectors

# Build frontend
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo ""
    echo "Building frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    echo "Building frontend..."
    npm run build
    
    echo -e "${GREEN}✓ Frontend built${NC}"
    
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the application:"
echo "  ./run.sh"
echo ""
echo "Make sure Ollama is running if you want to use RAG:"
echo "  ollama serve"
echo "  ollama list  # to see available models"
echo ""