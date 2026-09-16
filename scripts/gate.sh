#!/bin/sh
# gate.sh <task> — run every evidence producer for a task and try to close it.
set -u
T=$1; L="node $HOME/.agents/loop/loop.mjs"
node ~/.agents/gates/verify.mjs --json 2>/dev/null | $L evidence code --from - 2>&1 | tail -1
node ~/.agents/gates/runtime-verify.mjs --json 2>/dev/null > .agent/runtime.json; $L evidence runtime --from .agent/runtime.json 2>&1 | tail -1
node scripts/ui-evidence.mjs "$T" >/dev/null 2>&1; $L evidence ui --from ".agent/evidence/$T/ui.json" --tool playwright 2>&1 | tail -1
$L done "$T" 2>&1 | tail -4
