#!/usr/bin/env bash
# beforeShellExecution: ask the user before git commit / git push.
. "$(dirname "$0")/lib/env.sh"
exec node .cursor/hooks/lib/guard-git.mjs
