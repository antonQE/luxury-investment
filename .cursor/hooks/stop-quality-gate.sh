#!/usr/bin/env bash
# stop: Prettier check + ESLint + typecheck for files edited in this turn.
. "$(dirname "$0")/lib/env.sh"
exec node .cursor/hooks/lib/stop-quality-gate.mjs
