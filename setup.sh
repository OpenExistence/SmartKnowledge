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
echo "Installing dependencies..."
pip install -r requirements.txt

# Optional: Install heavy dependencies
echo ""
echo -e "${YELLOW}Installing optional dependencies (Whisper, Sentence Transformers)?${NC}"
echo "These are required for transcription and RAG features."
echo "They are heavy (~2GB). Press y to install, any other key to skip: "
read -r install_optional

if [ "$install_optional" = "y" ] || [ "$install_optional" = "Y" ]; then
    echo "Installing Whisper, sentence-transformers, and ollama..."
    pip install faster-whisper sentence-transformers ollama
    
    # Install PyTorch CPU (lighter than GPU version)
    echo "Installing PyTorch CPU..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    
    echo -e "${GREEN}Optional dependencies installed!${NC}"
else
    echo "Skipping optional dependencies."
    echo "You can install them later with:"
    echo "  pip install faster-whisper sentence-transformers ollama"
    echo "  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu"
fi

# Go back to project root
cd ..

# Create data directories
echo "Creating data directories..."
mkdir -p backend/data/audio
mkdir -p backend/data/transcriptions
mkdir -p backend/data/db/vectors

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the application:"
echo "  ./run.sh"
echo ""
echo "Or manually:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  cd src"
echo "  python3 app.py"
