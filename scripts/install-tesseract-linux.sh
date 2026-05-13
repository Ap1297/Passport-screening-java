#!/bin/bash

# Tesseract OCR Installation Script for Linux

echo "Installing Tesseract OCR for Linux..."
echo ""

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect Linux distribution"
    exit 1
fi

case $OS in
    ubuntu|debian)
        echo "Detected Debian/Ubuntu system"
        sudo apt-get update
        sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
        ;;
    fedora|rhel|centos)
        echo "Detected Fedora/RHEL/CentOS system"
        sudo yum install -y tesseract tesseract-langpack-eng
        ;;
    arch)
        echo "Detected Arch Linux system"
        sudo pacman -S tesseract
        ;;
    *)
        echo "Unsupported distribution: $OS"
        echo "Please install Tesseract manually from: https://github.com/tesseract-ocr/tesseract/wiki"
        exit 1
        ;;
esac

# Verify installation
echo ""
echo "Verifying installation..."
tesseract --version

# Find tessdata directory
echo ""
echo "Finding tessdata directory..."
TESSDATA=$(find /usr -name tessdata -type d 2>/dev/null | head -n 1)

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
