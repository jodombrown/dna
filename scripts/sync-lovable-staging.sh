#!/usr/bin/env bash
#
# sync-lovable-staging.sh — run before every Lovable session.
#
# Fast-forwards the shared `dna-lovable-staging` branch up to `main` and pushes,
# so each Lovable session starts from the latest reviewed code. This is a
# fast-forward-only sync: it never creates a merge commit and never rewrites
# history. If `dna-lovable-staging` has diverged from `main` (i.e. it carries
# commits that are not on `main`), the script stops and asks you to reconcile
# by hand rather than guessing.
#
# Usage:
#   ./scripts/sync-lovable-staging.sh        # sync and push
#   ./scripts/sync-lovable-staging.sh --dry-run   # show what would happen, no push
#
# Exit codes:
#   0  in sync (or fast-forwarded) and pushed
#   1  precondition failed (dirty tree, not a git repo, etc.)
#   2  branch diverged — manual reconciliation required
#   3  push failed after retries

set -euo pipefail

BASE_BRANCH="main"
STAGING_BRANCH="dna-lovable-staging"
REMOTE="origin"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "error: unknown argument '$arg' (try --help)" >&2
      exit 1
      ;;
  esac
done

# --- Move to the repo root, wherever this script was invoked from ------------
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "error: not inside a git repository" >&2
  exit 1
fi
cd "$REPO_ROOT"

# --- Refuse to run on a dirty tree so nothing local is clobbered -------------
if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is not clean. Commit or stash your changes first." >&2
  git status --short >&2
  exit 1
fi

STARTING_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# --- Fetch the two branches we care about ------------------------------------
fetch_with_retry() {
  local delay=2
  for attempt in 1 2 3 4; do
    if git fetch "$REMOTE" "$BASE_BRANCH" "$STAGING_BRANCH"; then
      return 0
    fi
    echo "fetch failed (attempt $attempt); retrying in ${delay}s..." >&2
    sleep "$delay"
    delay=$(( delay * 2 ))
  done
  echo "error: could not fetch from $REMOTE after 4 attempts" >&2
  exit 1
}

echo "==> Fetching $BASE_BRANCH and $STAGING_BRANCH from $REMOTE"
fetch_with_retry

# --- Check out staging (create a local tracking branch if needed) ------------
if git show-ref --verify --quiet "refs/heads/$STAGING_BRANCH"; then
  git checkout "$STAGING_BRANCH"
else
  git checkout -b "$STAGING_BRANCH" "$REMOTE/$STAGING_BRANCH"
fi

# --- Detect divergence before touching anything ------------------------------
# Commits on staging that are NOT on main => staging has diverged.
AHEAD_COUNT="$(git rev-list --count "$REMOTE/$BASE_BRANCH..HEAD")"
if [[ "$AHEAD_COUNT" -gt 0 ]]; then
  echo "error: $STAGING_BRANCH has $AHEAD_COUNT commit(s) not on $BASE_BRANCH." >&2
  echo "       A fast-forward-only sync is not possible. Reconcile manually:" >&2
  echo "         git log --oneline $REMOTE/$BASE_BRANCH..$STAGING_BRANCH" >&2
  git checkout "$STARTING_BRANCH" >/dev/null 2>&1 || true
  exit 2
fi

# --- Fast-forward staging up to main -----------------------------------------
BEHIND_COUNT="$(git rev-list --count "HEAD..$REMOTE/$BASE_BRANCH")"
if [[ "$BEHIND_COUNT" -eq 0 ]]; then
  echo "==> $STAGING_BRANCH is already up to date with $BASE_BRANCH."
else
  echo "==> Fast-forwarding $STAGING_BRANCH by $BEHIND_COUNT commit(s) to $BASE_BRANCH"
  git merge --ff-only "$REMOTE/$BASE_BRANCH"
fi

# --- Push (with retry/backoff on network failures) ---------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "==> [dry-run] would push $STAGING_BRANCH to $REMOTE (skipped)"
else
  push_with_retry() {
    local delay=2
    for attempt in 1 2 3 4; do
      if git push -u "$REMOTE" "$STAGING_BRANCH"; then
        return 0
      fi
      echo "push failed (attempt $attempt); retrying in ${delay}s..." >&2
      sleep "$delay"
      delay=$(( delay * 2 ))
    done
    return 1
  }

  echo "==> Pushing $STAGING_BRANCH to $REMOTE"
  if ! push_with_retry; then
    echo "error: push failed after 4 attempts" >&2
    exit 3
  fi
fi

# --- Report ------------------------------------------------------------------
echo "==> $STAGING_BRANCH now at:"
git log --oneline -1 "$REMOTE/$STAGING_BRANCH" 2>/dev/null || git log --oneline -1 HEAD

echo "Done."
