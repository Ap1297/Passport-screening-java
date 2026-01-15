#!/bin/bash

# Passport Screening - Build Script for Java 8
set -e

echo "================================"
echo "Passport Screening Build Script"
echo "================================"
echo ""

# Check Java version
echo "[1/4] Checking Java version..."
JAVA_VERSION=$(java -version 2>&1 | grep -oP '(?<=")\d+\.\d+' | head -1)
echo "Found Java version: $JAVA_VERSION"

if [[ ! "$JAVA_VERSION" =~ ^1\.8 ]]; then
  echo "WARNING: This project requires Java 8 (1.8.x)"
  echo "Current Java: $JAVA_VERSION"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check Maven
echo ""
echo "[2/4] Checking Maven..."
which mvn > /dev/null || { echo "Maven not found. Please install Maven."; exit 1; }
mvn --version

# Clean build
echo ""
echo "[3/4] Building application..."
mvn clean package -DskipTests

# Verify build
echo ""
echo "[4/4] Verifying build..."
if [ -f "target/passport-screening-1.0.0.jar" ]; then
  echo "✓ Build successful!"
  echo "JAR file: target/passport-screening-1.0.0.jar"
  echo ""
  echo "To run the application:"
  echo "  java -jar target/passport-screening-1.0.0.jar"
else
  echo "✗ Build failed. JAR not found."
  exit 1
fi
