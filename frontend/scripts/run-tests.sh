#!/bin/bash

echo "Running Frontend Tests..."
echo ""

# Install dependencies if needed
npm install

# Run unit tests
echo "Running Jest tests..."
npm test -- --coverage

# Run E2E tests (if Cypress is configured)
if [ -d "cypress" ]; then
    echo ""
    echo "Running E2E tests..."
    npm run test:e2e
fi

echo ""
echo "✓ All frontend tests completed"
