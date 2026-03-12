#!/bin/bash
# Scrape accenttravelagency.com — polite mirror with wget
# Throttled to ~3 second delays between requests to appear as normal browsing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MIRROR_DIR="$PROJECT_DIR/scrape/mirror"

mkdir -p "$MIRROR_DIR"

echo "Starting polite mirror of accenttravelagency.com..."
echo "Output: $MIRROR_DIR"
echo ""

wget \
  --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --wait=3 \
  --random-wait \
  --limit-rate=50k \
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" \
  --directory-prefix="$MIRROR_DIR" \
  --no-check-certificate \
  --reject="*.exe,*.zip,*.tar,*.gz" \
  --timeout=30 \
  --tries=2 \
  https://accenttravelagency.com/ \
  2>&1 | tee "$PROJECT_DIR/scrape/wget.log"

echo ""
echo "Mirror complete. Files saved to: $MIRROR_DIR"
echo "Log saved to: $PROJECT_DIR/scrape/wget.log"
