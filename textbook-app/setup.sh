#!/bin/bash
echo "=========================================="
echo " Computing Arts Textbook - Setup"
echo "=========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

echo "[1/3] Copying textbook content..."
mkdir -p content
cp -r ../textbook/* content/

echo "[2/3] Installing dependencies..."
npm install

echo "[3/3] Done!"
echo ""
echo "=========================================="
echo " To launch the textbook app, run:"
echo "   npm start"
echo ""
echo " To build a standalone installer:"
echo "   npm run build-win   (Windows)"
echo "   npm run build-mac   (macOS)"
echo "   npm run build-linux (Linux)"
echo "=========================================="
