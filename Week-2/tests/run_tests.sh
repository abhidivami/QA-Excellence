#!/bin/bash
# Petstore API Test Runner
# Runs the Postman collection via Newman and saves results to the results/ folder.
#
# Usage:
#   chmod +x run_tests.sh
#   ./run_tests.sh

set -e

echo "============================================"
echo " Petstore API — Production Grade Test Suite"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Install from: https://nodejs.org"
    exit 1
fi

echo "Node.js: $(node --version)"

# Install Newman if missing
if ! command -v newman &>/dev/null; then
    echo ""
    echo "Newman not found. Installing Newman + HTML reporter..."
    npm install -g newman newman-reporter-htmlextra
fi

echo "Newman: $(newman --version)"
echo ""

# Create results folder
mkdir -p results

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
HTML_REPORT="results/report_${TIMESTAMP}.html"
JSON_REPORT="results/report_${TIMESTAMP}.json"
LOG_FILE="results/run_${TIMESTAMP}.log"

echo "Collection  : api/postman/petstore_collection.json"
echo "Environment : api/postman/petstore_environment.json"
echo "Timestamp   : ${TIMESTAMP}"
echo "HTML Report : ${HTML_REPORT}"
echo "JSON Report : ${JSON_REPORT}"
echo ""
echo "--------------------------------------------"
echo ""

# Run Newman
newman run api/postman/petstore_collection.json \
    -e api/postman/petstore_environment.json \
    --reporters cli,htmlextra,json \
    --reporter-htmlextra-export "${HTML_REPORT}" \
    --reporter-htmlextra-title "Petstore API Test Report — ${TIMESTAMP}" \
    --reporter-htmlextra-showOnlyFails false \
    --reporter-json-export "${JSON_REPORT}" \
    --delay-request 300 \
    --timeout-request 15000 \
    --color on \
    2>&1 | tee "${LOG_FILE}"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "============================================"
echo " Results Summary"
echo "============================================"
echo ""
echo "HTML Report : ${HTML_REPORT}"
echo "JSON Report : ${JSON_REPORT}"
echo "Console Log : ${LOG_FILE}"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "RESULT: ALL TESTS PASSED"
else
    echo "RESULT: SOME TESTS FAILED — check the HTML report for details"
fi

echo ""
echo "Open the HTML report in a browser to see the full pass/fail breakdown."

exit $EXIT_CODE
