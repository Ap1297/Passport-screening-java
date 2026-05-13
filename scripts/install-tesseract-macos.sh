#!/bin/bash

# Tesseract OCR Installation Script for macOS

echo "Installing Tesseract OCR for macOS..."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Tesseract
echo "Installing Tesseract via Homebrew..."
brew install tesseract

# Verify installation
echo ""
echo "Verifying installation..."
tesseract --version

# Find tessdata directory
echo ""
echo "Finding tessdata directory..."

# Check for Intel Mac path
if [ -d "/usr/local/share/tessdata" ]; then
    TESSDATA="/usr/local/share/tessdata"
# Check for Apple Silicon Mac path
elif [ -d "/opt/homebrew/share/tessdata" ]; then
    TESSDATA="/opt/homebrew/share/tessdata"
else
    TESSDATA=$(find /usr/local -name tessdata -type d 2>/dev/null | head -n 1)
fi

if [ -z "$TESSDATA" ]; then
    echo "tessdata not found! Please check your Tesseract installation."
    exit 1
fi

echo "Found tessdata at: $TESSDATA"
echo ""
echo "Update application.yml with:"
echo "app:"
echo "  ocr:"
echo "    tessdata-path: $TESSDATA"
echo ""
echo "Installation complete!"
