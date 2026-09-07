#!/usr/bin/env bash
# Refresh the public mirrors of health-tracker and ai-workout-dj from their
# private originals, stripping the files that must never go public. The
# private repos are the working repos; the public ones are read-only copies
# with the same commit history minus the excluded paths.
#
#   health-tracker-private -> health-tracker   (drops meals.jsonl, NOTES.md,
#                                               lifts.jsonl, the personal-health-os
#                                               design doc; scrubs chat id)
#   ai-workout-dj-private  -> ai-workout-dj    (drops ios/Resources/*.mp3)
#
# Usage: scripts/republish-public-mirrors.sh [health|awdj|all]   (default: all)
set -euo pipefail

WHICH="${1:-all}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/republish-XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

mirror() {
  local private="$1" public="$2" index_filter="$3" tree_filter="${4:-true}" msg_filter="${5:-cat}"
  local dir="$WORK/$public"
  echo "== $private -> $public"
  git clone -q "https://github.com/eroberts7799/$private.git" "$dir"
  git -C "$dir" remote remove origin
  FILTER_BRANCH_SQUELCH_WARNING=1 git -C "$dir" filter-branch -f \
    --index-filter "$index_filter" \
    --tree-filter "$tree_filter" \
    --msg-filter "$msg_filter" \
    -- --all >/dev/null
  git -C "$dir" for-each-ref --format='%(refname)' refs/original/ \
    | xargs -n1 git -C "$dir" update-ref -d 2>/dev/null || true
  git -C "$dir" reflog expire --expire=now --all
  git -C "$dir" gc -q --prune=now
  git -C "$dir" remote add origin "https://github.com/eroberts7799/$public.git"
  # Force is required: the public history is a rewrite, so it never fast-forwards.
  git -C "$dir" push -q --force origin main
  echo "   pushed $(git -C "$dir" rev-list --count main) commits"
}

if [ "$WHICH" = all ] || [ "$WHICH" = health ]; then
  mirror health-tracker-private health-tracker \
    'git rm -q -r --cached --ignore-unmatch meals.jsonl NOTES.md lifts.jsonl docs/designs/personal-health-os.md' \
    'sed -i "" "s/TELEGRAM_CHAT_ID=[0-9]*/TELEGRAM_CHAT_ID=<your-chat-id>/g" HERMES.md 2>/dev/null || true' \
    'sed "s/, 64kg LBM//; s/64kg LBM//"'
fi

if [ "$WHICH" = all ] || [ "$WHICH" = awdj ]; then
  mirror ai-workout-dj-private ai-workout-dj \
    'git rm -q -r --cached --ignore-unmatch "ios/Resources/*.mp3"'
fi
