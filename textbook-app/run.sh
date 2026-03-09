#!/bin/bash
echo "=========================================="
echo " Computing Arts Textbook - Launching..."
echo "=========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run setup.sh first, followed by this script."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Running setup first..."
    echo ""
    bash setup.sh
fi

echo "Starting the textbook app..."
npm start
