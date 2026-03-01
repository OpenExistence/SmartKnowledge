#!/bin/bash
# SmartKnowledge Launcher
# Usage: ./run.sh

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Error: Virtual environment not found."
    echo "Run ./setup.sh first to create it."
    exit 1
fi

# Check if Flask app exists
if [ ! -f "src/app.py" ]; then
    echo "Error: app.py not found in src/"
    exit 1
fi

# Start the application
echo "Starting SmartKnowledge..."
cd src
python3 app.py
