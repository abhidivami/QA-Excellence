#!/bin/bash

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="playwright-report"

echo "=== Week 3 — Playwright E2E Tests ==="
echo "Run started: $TIMESTAMP"
echo "Target: https://www.saucedemo.com"
echo ""

npx playwright test "$@" 2>&1 | tee "playwright-report/run_${TIMESTAMP}.log"

echo ""
echo "=== Run complete: $TIMESTAMP ==="
echo "HTML report: $RESULTS_DIR/index.html"
echo "To view: npm run report"
