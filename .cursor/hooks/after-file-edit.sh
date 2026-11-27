#!/usr/bin/env bash
# afterFileEdit: Prettier on the edited file + record it for the stop gate.
. "$(dirname "$0")/lib/env.sh"
exec node .cursor/hooks/lib/after-file-edit.mjs
