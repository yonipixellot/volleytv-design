#!/usr/bin/env bash
# ponytail: one shared script instead of copy-pasting this git plumbing into
# 3 workflows (prod deploy, PR preview deploy, cleanup cron).
#
# The `gh-pages` branch here is NOT the configured Pages source (this repo's
# Pages is a private "build_type: workflow" site, deployed via
# actions/upload-pages-artifact + actions/deploy-pages). It's just a git-backed
# accumulation buffer: every deploy checks it out, edits only its own
# directory (root for prod, previews/pr-N for a PR), commits, and pushes -
# so a new deploy never has to know what the other deploys already published.
# Whoever runs last still uploads the WHOLE buffer as the Pages artifact.
set -euo pipefail

BUFFER_DIR="pages-buffer"

case "${1:-}" in
  prepare)
    if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
      git fetch origin gh-pages
      git worktree add -B gh-pages "$BUFFER_DIR" origin/gh-pages
    else
      # Bootstrap: no gh-pages branch yet, start it empty.
      git worktree add --detach "$BUFFER_DIR"
      git -C "$BUFFER_DIR" checkout --orphan gh-pages
      git -C "$BUFFER_DIR" rm -rf . >/dev/null 2>&1 || true
      find "$BUFFER_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
    fi
    ;;
  publish)
    message="${2:-update pages buffer}"
    git -C "$BUFFER_DIR" add -A
    if git -C "$BUFFER_DIR" diff --cached --quiet; then
      echo "No changes to publish to gh-pages buffer."
    else
      git -C "$BUFFER_DIR" \
        -c user.name="github-actions[bot]" \
        -c user.email="github-actions[bot]@users.noreply.github.com" \
        commit -m "$message"
      git -C "$BUFFER_DIR" push origin gh-pages
    fi
    ;;
  *)
    echo "Usage: $0 {prepare|publish <message>}" >&2
    exit 1
    ;;
esac
