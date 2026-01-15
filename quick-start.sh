#!/bin/bash

# Quick Start Script - Passport Screening Application
# This script automates the setup process

set -e

echo "=========================================="
echo "Passport Screening - Quick Start Setup"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Java 8
echo -e "${YELLOW}[1/5] Checking Java 8...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ Java not found. Please install Java 8.${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oP '(?<=")\d+\.\d+' | head -1)
if [[ ! "$JAVA_VERSION" =~ ^1\.8 ]]; then
    echo -e "${YELLOW}⚠ Warning: Java 8 recommended, found $JAVA_VERSION${NC}"
fi
echo -e "${GREEN}✓ Java $JAVA_VERSION found${NC}"
echo ""

# Check Maven
echo -e "${YELLOW}[2/5] Checking Maven...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}✗ Maven not found. Please install Maven.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Maven found${NC}"
echo ""

# Check Tesseract
echo -e "${YELLOW}[3/5] Checking Tesseract OCR...${NC}"
if ! command -v tesseract &> /dev/null; then
    echo -e "${YELLOW}⚠ Tesseract not found. OCR features will not work.${NC}"
    read -p "Install Tesseract? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y tesseract-ocr
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install tesseract
        fi
    fi
else
    echo -e "${GREEN}✓ Tesseract found${NC}"
fi
echo ""

# Create .env if not exists
echo -e "${YELLOW}[4/5] Setting up configuration...${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/passport_screening
REACT_APP_API_URL=http://localhost:8080/api
APP_SECURITY_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
EOF
    echo -e "${GREEN}✓ .env created${NC}"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi
echo ""

# Build backend
echo -e "${YELLOW}[5/5] Building backend...${NC}"
cd backend
mvn clean package -DskipTests -q
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
cd ..
echo ""

echo "=========================================="
echo -e "${GREEN}Setup complete!${NC}"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Terminal 1 - Start Backend:"
echo -e "   ${YELLOW}cd backend && mvn spring-boot:run${NC}"
echo ""
echo "2. Terminal 2 - Start Frontend:"
echo -e "   ${YELLOW}cd frontend && npm install && npm start${NC}"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "For Docker setup, run:"
echo -e "   ${YELLOW}docker-compose up -d${NC}"
echo ""
