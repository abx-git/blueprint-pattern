#!/usr/bin/env bash
# Build docs/studio and push dist/ to the pages remote (agm.github.io main).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE="${AGM_PAGES_REMOTE:-pages}"
BRANCH="${AGM_PAGES_BRANCH:-main}"
EXPECTED_PAGES_URL="${AGM_PAGES_REPO_URL:-https://github.com/abx-git/agm.github.io.git}"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' missing. Adding agm.github.io…" >&2
  git remote add "$REMOTE" "$EXPECTED_PAGES_URL"
fi

REMOTE_URL="$(git remote get-url "$REMOTE")"
case "$REMOTE_URL" in
  *agm.github.io*) ;;
  *blueprint-pattern.github.io*)
    echo "Remote '$REMOTE' still points at the old blueprint-pattern.github.io repo:" >&2
    echo "  $REMOTE_URL" >&2
    echo "Updating to $EXPECTED_PAGES_URL" >&2
    git remote set-url "$REMOTE" "$EXPECTED_PAGES_URL"
    ;;
  *)
    echo "Warning: remote '$REMOTE' is $REMOTE_URL (expected agm.github.io)." >&2
    ;;
esac

./scripts/sync-assistant-data.py

echo "Building AGM Review Studio…"
(
  cd docs/studio
  if [[ ! -d node_modules ]]; then
    npm install
  fi
  npm run build
)

SITE="${TMPDIR:-/tmp}/agm-studio-pages-$$"
rm -rf "$SITE"
mkdir -p "$SITE"
rsync -a docs/studio/dist/ "$SITE/"
touch "$SITE/.nojekyll"

cd "$SITE"
git init
git checkout -b "$BRANCH"
git add -A
git commit -m "Deploy AGM Review Studio"
git remote add origin "$(git -C "$ROOT" remote get-url "$REMOTE")"
echo "Pushing to ${REMOTE} ${BRANCH}…"
git push --force-with-lease origin "${BRANCH}"

echo "Done. Site: https://abx-git.github.io/agm.github.io/"
echo "Note: Deployments live on abx-git/agm.github.io (branch Pages), not on abx-git/agm/deployments."
