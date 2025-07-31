#!/bin/bash
set -e
BIN="./nano-node/build/nano_node"
if [ ! -f "$BIN" ]; then
  echo "nano_node binary not found. Run scripts/setup-nano-node.sh first." >&2
  exit 1
fi
exec "$BIN" --daemon "$@"
