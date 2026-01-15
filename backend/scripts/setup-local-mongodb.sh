#!/bin/bash

# Setup script for local MongoDB development

echo "Setting up local MongoDB..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB not found. Installing..."
    
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew tap mongodb/brew
        brew install mongodb-community
        brew services start mongodb-community
    
    # For Ubuntu/Debian
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        sudo systemctl start mongod
    fi
else
    echo "MongoDB is already installed"
fi

# Create database and initial indexes
mongosh << EOF
use passport_screening

// Create sanctioned_individuals collection with indexes
db.createCollection("sanctioned_individuals")
db.sanctioned_individuals.createIndex({ "name": 1 })
db.sanctioned_individuals.createIndex({ "nameNormalized": 1 })
db.sanctioned_individuals.createIndex({ "isActive": 1 })

// Create cache_metadata collection
db.createCollection("cache_metadata")
db.cache_metadata.createIndex({ "id": 1 })

print("MongoDB setup complete!")
EOF

echo "✓ Local MongoDB setup complete"
