#!/usr/bin/env bash
set -euo pipefail

echo "==========================================="
echo " Running Local Lint and Test Suite"
echo "==========================================="

echo "1. Checking JavaScript syntax..."
npm run lint

echo "2. Running automated unit & integration tests..."
npm test

echo "✅ All tests passed successfully!"

