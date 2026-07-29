#!/usr/bin/env bash
set -euo pipefail
STAGING=dna-lovable-staging

git fetch --quiet origin main "$STAGING"
M=$(git rev-parse origin/main)
S=$(git rev-parse "origin/$STAGING")
echo "main    = ${M:0:10}"
echo "staging = ${S:0:10}"

if [ "$M" = "$S" ]; then
  echo "Already in sync. Lovable is safe to open."
  exit 0
fi

AHEAD=$(git rev-list --count "$M".."origin/$STAGING")
if [ "$AHEAD" -gt 0 ]; then
  echo "STOP. staging has $AHEAD commit(s) main does not have."
  echo "That is unmerged Lovable work. PR $STAGING into main and merge it FIRST."
  git log --oneline "$M".."origin/$STAGING"
  exit 1
fi

git checkout "$STAGING"
git merge --ff-only origin/main
git push origin "$STAGING"
git fetch --quiet origin "$STAGING"
NEW=$(git rev-parse "origin/$STAGING")
if [ "$NEW" = "$M" ]; then
  echo "SYNCED. staging at ${NEW:0:10}. Lovable is safe to open."
else
  echo "FAILED. staging at ${NEW:0:10}, expected ${M:0:10}."
  exit 1
fi
