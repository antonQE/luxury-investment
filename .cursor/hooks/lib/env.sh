#!/usr/bin/env bash
# Shared setup for project hooks: run from the repo root with the Node version from .nvmrc.
# Hook processes do not load the user's shell profile, so nvm's PATH is missing by default.

cd "${CURSOR_PROJECT_DIR:-$(pwd)}" || exit 0

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
  nvm use >/dev/null 2>&1 || true
fi
