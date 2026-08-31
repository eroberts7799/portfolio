#!/bin/bash
# Daily vitals sync: export from health-tracker, and if the numbers changed,
# commit + push + deploy. Intended to run from launchd each morning.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 scripts/export-vitals.py

if git diff --quiet data/vitals.json; then
  echo "vitals unchanged — no deploy"
  exit 0
fi

git add data/vitals.json
git commit -m "vitals: daily sync $(date +%Y-%m-%d)"
git push origin main
vercel --prod --yes
echo "vitals synced and deployed"
