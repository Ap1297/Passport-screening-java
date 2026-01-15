#!/bin/bash

echo "Running Backend Tests..."
echo ""

# Run all tests
echo "Running JUnit tests..."
mvn test

# Run integration tests
echo ""
echo "Running integration tests..."
mvn test -Dgroups=integration

# Display test results
echo ""
echo "Test Summary:"
mvn surefire-report:report

echo ""
echo "✓ All tests completed"
