#!/bin/bash
# Code Test Runner — Unit Tests + API Tests
# Runs Jest test suites and saves results to the results/ folder.
#
# Usage:
#   chmod +x run_code_tests.sh
#   ./run_code_tests.sh          # run both unit + api tests
#   ./run_code_tests.sh unit     # run only unit tests
#   ./run_code_tests.sh api      # run only api tests

set -e

SUITE=${1:-"all"}

echo "============================================"
echo " QA Week-2 — Code Test Runner (Jest)"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is not installed. Install from https://nodejs.org"
    exit 1
fi

echo "Node.js : $(node --version)"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Jest    : $(npx jest --version)"
echo ""

mkdir -p results

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
JSON_REPORT="results/jest_report_${TIMESTAMP}.json"
LOG_FILE="results/jest_run_${TIMESTAMP}.log"

echo "Suite   : ${SUITE}"
echo "JSON    : ${JSON_REPORT}"
echo "Log     : ${LOG_FILE}"
echo ""
echo "--------------------------------------------"
echo ""

EXIT_CODE=0

if [ "$SUITE" = "unit" ]; then
    npx jest unit_tests --verbose \
        --json --outputFile="${JSON_REPORT}" \
        2>&1 | tee "${LOG_FILE}" || EXIT_CODE=$?

elif [ "$SUITE" = "api" ]; then
    npx jest api_tests --verbose --runInBand \
        --json --outputFile="${JSON_REPORT}" \
        2>&1 | tee "${LOG_FILE}" || EXIT_CODE=$?

else
    # Run unit tests first (fast, no network), then API tests
    echo "==> Running Unit Tests first..."
    npx jest unit_tests --verbose \
        --json --outputFile="results/jest_unit_${TIMESTAMP}.json" \
        2>&1 | tee "results/jest_unit_${TIMESTAMP}.log" || EXIT_CODE=$?

    echo ""
    echo "==> Running API Tests..."
    npx jest api_tests --verbose --runInBand \
        --json --outputFile="results/jest_api_${TIMESTAMP}.json" \
        2>&1 | tee "results/jest_api_${TIMESTAMP}.log" || EXIT_CODE=$?
fi

echo ""
echo "============================================"
echo " Results Summary"
echo "============================================"
echo ""

if [ "$SUITE" = "all" ]; then
    echo "Unit Test Log  : results/jest_unit_${TIMESTAMP}.log"
    echo "Unit Test JSON : results/jest_unit_${TIMESTAMP}.json"
    echo "API Test Log   : results/jest_api_${TIMESTAMP}.log"
    echo "API Test JSON  : results/jest_api_${TIMESTAMP}.json"
else
    echo "Log  : ${LOG_FILE}"
    echo "JSON : ${JSON_REPORT}"
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "RESULT: ALL TESTS PASSED"
else
    echo "RESULT: SOME TESTS FAILED — check the log above for details"
fi

exit $EXIT_CODE
