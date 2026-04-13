#!/bin/bash
# SmartKnowledge Launcher
# Usage: ./run.sh

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo -e "${RED}Error: Virtual environment not found.${NC}"
    echo "Run ./setup.sh first to create it."
    exit 1
fi

# Check if Flask app exists
if [ ! -f "src/app.py" ]; then
    echo -e "${RED}Error: app.py not found in src/${NC}"
    exit 1
fi

# Set PYTHONPATH
export PYTHONPATH="$SCRIPT_DIR/backend"

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}Warning: Frontend not built. Building now...${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm run build
    cd "$SCRIPT_DIR/backend"
fi

# Check Ollama availability
echo ""
echo "Checking Ollama..."
if command -v ollama &> /dev/null; then
    # Try to check if Ollama is running
    if curl -s http://localhost:11434/api/version &>/dev/null; then
        echo -e "${GREEN}✓ Ollama is running${NC}"
        ollama list
    else
        echo -e "${YELLOW}⚠ Ollama is installed but not running${NC}"
        echo "  Start it with: ollama serve"
        echo "  Or run in background: ollama serve &"
    fi
else
    echo -e "${YELLOW}⚠ Ollama not found${NC}"
    echo "  The Knowledge Base RAG feature will use fallback mode."
    echo "  Install Ollama from: https://github.com/ollama/ollama"
fi
echo ""

# Start the application
echo "Starting SmartKnowledge..."
cd src
python3 app.py