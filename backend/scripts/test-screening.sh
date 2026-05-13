#!/bin/bash

# Test script for passport screening API

API_URL="http://localhost:8080/api/screening"

echo "Testing Passport Screening API..."
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$API_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Sample screening (requires actual file)
echo "2. To test screening with a real file, use:"
echo ""
echo "curl -X POST $API_URL/check \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"file\": \"<base64_encoded_file>\","
echo "    \"fileName\": \"passport.pdf\","
echo "    \"fileType\": \"application/pdf\""
echo "  }'"
echo ""

echo "✓ API tests complete"
